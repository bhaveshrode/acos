import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Logger, LogEntry, Result, ResultError } from "acos-backend";
import type { LogWriter } from "acos-backend";
import { Mediator } from "acos-backend/application";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import {
  AcosIntegrationBoundary,
  OUTBOX_MAX_ATTEMPTS
} from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";
import { RefundOutcomeUnknownError } from "../src/integration/PaymentProvider.js";
import { PrismaClient } from "@prisma/client";

describe("ACOS Merchant — Track D3 Real PostgreSQL Validation Suite", () => {
  const logs: LogEntry[] = [];
  const writer: LogWriter = (entry) => {
    logs.push(entry);
  };

  const dbUrl = process.env.MERCHANT_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/acos?schema=public";
  
  let boundary: AcosIntegrationBoundary;
  let backend: MerchantBackend;
  let frontend: MerchantFrontend;
  let isDbAvailable = false;

  beforeAll(async () => {
    // 1. Check if database is reachable
    const pg = await import("pg");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const pool = new pg.default.Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      isDbAvailable = true;
    } catch (err) {
      console.warn("PostgreSQL database is not reachable or database does not exist. Skipping real PostgreSQL validation tests.");
      return;
    }

    // 2. Setup ACOS Runtime Subsystems Mock Factory
    const runtimeFactory = new RuntimeFactory();
    const backendMediator = new Mediator();
    runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], backendMediator));
    runtimeFactory.health.registerCheck("backend", async () => ({
      name: "backend",
      healthy: true
    } as any));

    // 3. Load config
    const config = MerchantConfig.loadFromEnv({
      port: 9005, // Different port to avoid collision
      env: "test-db",
      acosEndpoint: "http://localhost:3000",
      dbUrl: dbUrl,
      enableAcosFeatures: true
    });

    const boundaryLogger = new Logger("AcosDbBoundary", writer);
    boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
    backend = new MerchantBackend(config, boundary, writer);
    frontend = new MerchantFrontend(backend, writer);

    // Bootstrap with real dbUrl
    await boundary.connect("test", dbUrl, { allowInProcessBus: true });
    await backend.start();
  });

  afterAll(async () => {
    if (backend) {
      await backend.stop();
    }
  });

  it("should successfully execute CRUD, Webhooks, Idempotency, and Outbox persistence operations against PostgreSQL", async () => {
    if (!isDbAvailable) {
      // Skip test gracefully if DB is not available
      return;
    }

    // 1. User signup (checks User table)
    const email = `db_valid_${Date.now()}@example.com`;
    const password = "password123";
    const name = "DB Hardened Merchant";
    const prisma = (boundary as any).prismaClient;

    const user = await frontend.signUp(email, password, name);
    expect(user.email).toBe(email);

    // 2. User login
    await frontend.login(email, password);
    const me = await frontend.queryMe();
    expect(me.email).toBe(email);

    // 3. Business Onboarding (checks Organization & BusinessProfile tables)
    const biz = await frontend.onboardBusiness(
      "Postgres Shop",
      `pg-shop-${Date.now()}`,
      "USD",
      "Retail",
      "USA",
      "billing@pg-shop.test"
    );
    expect(biz.name).toBe("Postgres Shop");

    const orgRow = await prisma.organization.findUnique({ where: { id: biz.id } });
    expect(orgRow?.ownerId).toBe(user.id);

    const profileRow = await prisma.businessProfile.findUnique({ where: { organizationId: biz.id } });
    expect(profileRow?.businessType).toBe("Retail");
    expect(profileRow?.contactInfo).toBe("billing@pg-shop.test");

    // 4. Create Customer (checks Customer table)
    const customer = await frontend.createCustomer({
      name: "Alice DB",
      customerNumber: `CUST-DB-${Date.now()}`,
      primaryContact: {
        name: "Alice DB",
        email: "alice@example.com",
        phone: "+1-555-0199"
      },
      billingAddress: {
        line1: "123 Postgres Way",
        city: "Metropolis",
        state: "NY",
        country: "USA",
        postalCode: "10001"
      }
    });
    expect(customer.name).toBe("Alice DB");

    // 5. Create, Issue, and Send Invoice (checks Invoice & InvoiceLineItem table)
    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-DB-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [
        { description: "Database Services", quantity: 1, unitPrice: 100, taxRate: 0 }
      ]
    });
    expect(invoice.status).toBe("DRAFT");

    // Creation commits its domain event through the transactional outbox
    const createdEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "InvoiceCreated", aggregateId: invoice.id }
    });
    expect(createdEvt).toBeDefined();
    expect(createdEvt.eventId).toBeTruthy();
    expect(createdEvt.processed).toBe(true);

    await frontend.issueInvoice(invoice.id);

    const issuedEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "InvoiceIssued", aggregateId: invoice.id }
    });
    expect(issuedEvt).toBeDefined();
    expect(issuedEvt.processed).toBe(true);

    await frontend.sendInvoice(invoice.id);
    const sentInvoice = await frontend.getInvoice(invoice.id);
    expect(sentInvoice.status).toBe("SENT");

    const sentRow = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(sentRow.sentAt).toBeInstanceOf(Date);

    // 6. Collect Payment and process webhook (checks Payment & OutboxEvent & IdempotencyRecord tables)
    const payment = await frontend.collectPayment(invoice.id);
    expect(payment.amount).toBe(100);

    // Find payment record in DB to get gateway reference
    const dbPayment = await prisma.payment.findFirst({
      where: { invoiceId: invoice.id }
    });
    expect(dbPayment).toBeDefined();

    const gatewayRef = dbPayment.gatewayReference;
    expect(gatewayRef).toBeDefined();

    // The collecting gateway is persisted and replayed, not defaulted on read
    expect(dbPayment.method).toBe("STRIPE");
    const replayedPayment = await frontend.getPayment(payment.id);
    expect(replayedPayment.method).toBe("STRIPE");

    // Collecting the payment enqueues its own lifecycle transition
    const processingEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "PaymentProcessingStarted", aggregateId: dbPayment.id }
    });
    expect(processingEvt).toBeDefined();
    expect(processingEvt.processed).toBe(true);

    // Trigger webhook simulation
    await frontend.simulateWebhook(gatewayRef, true);

    // Verify invoice status updated to PAID (reconciliation completed)
    const finalInvoice = await frontend.getInvoice(invoice.id);
    expect(finalInvoice.status).toBe("PAID");

    // The receivable ledger is written in the reconciliation transaction
    const arRow = await prisma.receivableAccount.findFirst({
      where: { organizationId: finalInvoice.organizationId, customerId: finalInvoice.customerId }
    });
    expect(arRow).toBeDefined();
    const arEntry = await prisma.receivableEntry.findFirst({
      where: { accountId: arRow.id, invoiceId: invoice.id }
    });
    expect(arEntry.remainingAmount.toNumber()).toBe(0);

    // Verify outbox event record was persisted and processed
    const outboxEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "InvoicePaid" }
    });
    expect(outboxEvt).toBeDefined();
    expect(outboxEvt.processed).toBe(true);

    const confirmedEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "PaymentConfirmed", aggregateId: dbPayment.id }
    });
    expect(confirmedEvt).toBeDefined();
    expect(confirmedEvt.processed).toBe(true);

    // Verify idempotency record was created
    const idempotencyKey = `key-${Date.now()}`;
    await backend.handleRequest("POST", "/auth/signup", {
      email: `idemp_db_${Date.now()}@example.com`,
      password: "pass",
      name: "Idemp DB"
    }, { "Idempotency-Key": idempotencyKey });

    const idempRec = await prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey }
    });
    expect(idempRec).toBeDefined();
    expect(idempRec.statusCode).toBe(201);
  });

  it("should persist refunds and re-open invoice and receivable balances", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `refund_valid_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Refund Merchant");
    await frontend.login(email, "password123");
    const biz = await frontend.onboardBusiness("Refund Shop", `refund-shop-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Refund Rita",
      customerNumber: `CUST-REFUND-${Date.now()}`,
      primaryContact: { name: "Refund Rita", email: "rita@example.com" },
      billingAddress: { line1: "1 Return Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-REFUND-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Refundable Services", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    const payment = await frontend.collectPayment(invoice.id);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    await frontend.simulateWebhook(dbPayment.gatewayReference, true);

    const paidInvoice = await frontend.getInvoice(invoice.id);
    expect(paidInvoice.status).toBe("PAID");

    // Partial refund of 40: payment returns to CONFIRMED, invoice re-opens
    const partial = await frontend.refundPayment(payment.id, 40, "Partial return");
    expect(partial.status).toBe("CONFIRMED");

    let refundRows = await prisma.refund.findMany({ where: { paymentId: payment.id } });
    expect(refundRows).toHaveLength(1);
    expect(refundRows[0].status).toBe("COMPLETED");
    expect(refundRows[0].amount.toNumber()).toBe(40);
    expect(refundRows[0].reason).toBe("Partial return");
    expect(refundRows[0].organizationId).toBe(biz.id);

    const partialInvoice = await frontend.getInvoice(invoice.id);
    expect(partialInvoice.status).toBe("PARTIALLY_PAID");

    let arEntry = await prisma.receivableEntry.findFirst({
      where: { invoiceId: invoice.id }
    });
    expect(arEntry.remainingAmount.toNumber()).toBe(40);

    // Refund events reach the outbox
    const refundEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "InvoiceRefunded", aggregateId: invoice.id }
    });
    expect(refundEvt).toBeDefined();
    expect(refundEvt.processed).toBe(true);

    // Full refund of the remaining 60: payment REFUNDED; the kernel invoice
    // returns to ISSUED and the delivered invoice reports SENT
    const rest = await frontend.refundPayment(payment.id, 60, "Remaining return");
    expect(rest.status).toBe("REFUNDED");

    refundRows = await prisma.refund.findMany({ where: { paymentId: payment.id } });
    expect(refundRows).toHaveLength(2);

    const finalInvoice = await frontend.getInvoice(invoice.id);
    expect(finalInvoice.status).toBe("SENT");

    arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoice.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(100);

    // A fully refunded payment refuses further refunds
    await expect(frontend.refundPayment(payment.id, 1, "One dollar too many")).rejects.toThrow(/confirmed payments/i);
  });

  it("should persist overpayment credit attribution and refund it before the obligation", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `refund_overpay_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Overpay Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Overpay Shop", `overpay-shop-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Overpay Olga",
      customerNumber: `CUST-OVERPAY-${Date.now()}`,
      primaryContact: { name: "Overpay Olga", email: "olga@example.com" },
      billingAddress: { line1: "3 Surplus Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-OVERPAY-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Overpaid Services", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    // 150 collected against a 100 invoice: 50 settles as customer credit
    const payment = await frontend.collectPayment(invoice.id, 150);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    await frontend.simulateWebhook(dbPayment.gatewayReference, true);

    const overpaidInvoice = await frontend.getInvoice(invoice.id);
    expect(overpaidInvoice.status).toBe("OVERPAID");

    let credit = await prisma.receivableCredit.findFirst({ where: { settlementId: payment.id } });
    expect(credit.amount.toNumber()).toBe(50);
    expect(credit.remainingAmount.toNumber()).toBe(50);
    expect(credit.settlementId).toBe(payment.id);
    expect(credit.invoiceId).toBe(invoice.id);

    // Refunding the overpayment consumes credit only: the invoice stays settled
    const creditOnly = await frontend.refundPayment(payment.id, 50, "Return the overpayment");
    expect(creditOnly.status).toBe("CONFIRMED");

    expect((await frontend.getInvoice(invoice.id)).status).toBe("PAID");
    credit = await prisma.receivableCredit.findFirst({ where: { id: credit.id } });
    expect(credit.remainingAmount.toNumber()).toBe(0);
    expect(credit.settlementId).toBe(payment.id);
    expect(credit.invoiceId).toBe(invoice.id);
    let arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoice.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(0);

    // The rest re-opens the obligation the payment had settled
    const full = await frontend.refundPayment(payment.id, 100, "Cancel the sale");
    expect(full.status).toBe("REFUNDED");

    expect((await frontend.getInvoice(invoice.id)).status).toBe("SENT");
    arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoice.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(100);
    expect(await prisma.refund.count({ where: { paymentId: payment.id } })).toBe(2);
  });

  it("should persist customer credit applied to a second outstanding invoice", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `credit_apply_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Credit Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Credit Shop", `credit-shop-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Credit Cleo",
      customerNumber: `CUST-CREDIT-${Date.now()}`,
      primaryContact: { name: "Credit Cleo", email: "cleo@example.com" },
      billingAddress: { line1: "4 Surplus Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoiceA = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-A-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "First project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceA.id);
    await frontend.sendInvoice(invoiceA.id);

    // 200 collected against a 100 invoice: 100 settles as customer credit.
    const payment = await frontend.collectPayment(invoiceA.id, 200);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoiceA.id } });
    await frontend.simulateWebhook(dbPayment.gatewayReference, true);

    expect((await frontend.getInvoice(invoiceA.id)).status).toBe("OVERPAID");
    let credit = await prisma.receivableCredit.findFirst({ where: { settlementId: payment.id } });
    expect(credit.remainingAmount.toNumber()).toBe(100);

    const invoiceB = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-B-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Second project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceB.id);
    await frontend.sendInvoice(invoiceB.id);

    const first = await frontend.applyCreditToInvoice(invoiceB.id, 50);
    expect(first.amountApplied).toBe(50);
    expect(first.invoiceStatus).toBe("PARTIALLY_PAID");
    expect((await frontend.getInvoice(invoiceB.id)).status).toBe("PARTIALLY_PAID");

    credit = await prisma.receivableCredit.findFirst({ where: { id: credit.id } });
    expect(credit.remainingAmount.toNumber()).toBe(50);
    let arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoiceB.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(50);

    // Nothing to cap against: the remaining credit settles the invoice in full.
    const rest = await frontend.applyCreditToInvoice(invoiceB.id);
    expect(rest.amountApplied).toBe(50);
    expect(rest.invoiceStatus).toBe("PAID");
    expect((await frontend.getInvoice(invoiceB.id)).status).toBe("PAID");

    credit = await prisma.receivableCredit.findFirst({ where: { id: credit.id } });
    expect(credit.remainingAmount.toNumber()).toBe(0);
    arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoiceB.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(0);
  });

  it("serializes concurrent credit applications across independent database connections", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `credit_race_${Date.now()}@example.com`;
    const user = await frontend.signUp(email, "password123", "Credit Race Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Credit Race Shop", `credit-race-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Race Cleo",
      customerNumber: `CUST-CREDIT-RACE-${Date.now()}`,
      primaryContact: { name: "Race Cleo", email: "cleo-race@example.com" },
      billingAddress: { line1: "5 Surplus Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoiceA = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-RACE-A-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "First project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceA.id);
    await frontend.sendInvoice(invoiceA.id);

    // 160 collected against a 100 invoice leaves 60 of customer credit.
    await frontend.collectPayment(invoiceA.id, 160);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoiceA.id } });
    await frontend.simulateWebhook(dbPayment.gatewayReference, true);

    const invoiceB = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-RACE-B-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Second project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceB.id);
    await frontend.sendInvoice(invoiceB.id);

    const invoiceC = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-RACE-C-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Third project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceC.id);
    await frontend.sendInvoice(invoiceC.id);

    // A second boundary opens its own Prisma pool, so both applications run in
    // independent transactions/connections rather than sharing one process.
    const secondRuntime = new RuntimeFactory();
    secondRuntime.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));
    secondRuntime.health.registerCheck("backend", async () => ({ name: "backend", healthy: true } as any));
    const secondBoundary = new AcosIntegrationBoundary(new Logger("AcosDbBoundaryCreditRace", writer), secondRuntime);
    await secondBoundary.connect("test", dbUrl, { allowInProcessBus: true });

    try {
      // Each application targets its own invoice, so the invoice rows do not
      // collide — only the shared 60 of credit does. Without a ledger lock both
      // read it and both spend it; with one, the second re-reads the ledger
      // after the first commits and refuses.
      const [first, second] = await Promise.allSettled([
        boundary.applyCreditToInvoice(user.id, invoiceB.id, 60),
        secondBoundary.applyCreditToInvoice(user.id, invoiceC.id, 60)
      ]);

      const fulfilled = [first, second].filter((r) => r.status === "fulfilled");
      const rejected = [first, second].filter((r) => r.status === "rejected");
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason.message).toMatch(/Insufficient credit balance/);

      const account = await prisma.receivableAccount.findFirst({ where: { customerId: customer.id } });
      const credit = await prisma.receivableCredit.findFirst({ where: { accountId: account.id } });
      expect(credit.remainingAmount.toNumber()).toBe(0);
      const arEntries = await prisma.receivableEntry.findMany({
        where: { invoiceId: { in: [invoiceB.id, invoiceC.id] } }
      });
      expect(arEntries).toHaveLength(1);
      expect(arEntries[0].remainingAmount.toNumber()).toBe(40);

      const statuses = [(await frontend.getInvoice(invoiceB.id)).status, (await frontend.getInvoice(invoiceC.id)).status].sort();
      expect(statuses).toEqual(["PARTIALLY_PAID", "SENT"]);
    } finally {
      await secondBoundary.disconnect();
    }
  });

  it("counts applied credit when a card payment settles the rest of an invoice", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `credit_cash_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Credit Cash Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Credit Cash Shop", `credit-cash-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Cash Cleo",
      customerNumber: `CUST-CREDIT-CASH-${Date.now()}`,
      primaryContact: { name: "Cash Cleo", email: "cleo-cash@example.com" },
      billingAddress: { line1: "6 Surplus Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoiceA = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-CASH-A-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "First project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceA.id);
    await frontend.sendInvoice(invoiceA.id);

    // 160 collected against a 100 invoice leaves 60 of customer credit.
    await frontend.collectPayment(invoiceA.id, 160);
    const prisma = (boundary as any).prismaClient;
    const dbPaymentA = await prisma.payment.findFirst({ where: { invoiceId: invoiceA.id } });
    await frontend.simulateWebhook(dbPaymentA.gatewayReference, true);

    const invoiceB = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-CASH-B-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Second project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoiceB.id);
    await frontend.sendInvoice(invoiceB.id);

    // Credit settles 60 of the second invoice; 40 is left for the card.
    const applied = await frontend.applyCreditToInvoice(invoiceB.id, 60);
    expect(applied.invoiceStatus).toBe("PARTIALLY_PAID");
    expect((await frontend.getInvoice(invoiceB.id)).status).toBe("PARTIALLY_PAID");

    // The card payment covers only the 40 the credit left open. The webhook
    // sees 40 of payments against a 100 invoice, but the receivable entry is
    // already settled, so the invoice must be PAID.
    await frontend.collectPayment(invoiceB.id, 40);
    const dbPaymentB = await prisma.payment.findFirst({ where: { invoiceId: invoiceB.id } });
    await frontend.simulateWebhook(dbPaymentB.gatewayReference, true);

    expect((await frontend.getInvoice(invoiceB.id)).status).toBe("PAID");
    const arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoiceB.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(0);
    const account = await prisma.receivableAccount.findFirst({ where: { customerId: customer.id } });
    const credit = await prisma.receivableCredit.findFirst({ where: { accountId: account.id } });
    expect(credit.remainingAmount.toNumber()).toBe(0);
  });

  it("reports a customer's credit balance from the persisted ledger", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `credit_read_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Credit Read Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Credit Read Shop", `credit-read-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Crediting Cora",
      customerNumber: `CUST-CREDIT-READ-${Date.now()}`,
      primaryContact: { name: "Crediting Cora", email: "cora@example.com" },
      billingAddress: { line1: "7 Surplus Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-CREDIT-READ-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Overpaid project", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    // 160 collected against a 100 invoice leaves 60 of unapplied credit.
    await frontend.collectPayment(invoice.id, 160);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    await frontend.simulateWebhook(dbPayment.gatewayReference, true);

    const balance = await frontend.getCustomerCreditBalance(customer.id);
    expect(balance.customerId).toBe(customer.id);
    expect(balance.currency).toBe("USD");
    expect(balance.availableCredit).toBe(60);
  });

  it("should persist an asynchronous refund request and settle it from the webhook", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `refund_async_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Async Refund Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Async Refund Shop", `refund-async-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Async Rita",
      customerNumber: `CUST-ASYNC-${Date.now()}`,
      primaryContact: { name: "Async Rita", email: "rita-async@example.com" },
      billingAddress: { line1: "2 Return Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-ASYNC-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Refundable Services", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    const payment = await frontend.collectPayment(invoice.id);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });

    // The paid webhook captures the gateway payment id against the payment row
    await boundary.processPaymentWebhook(dbPayment.gatewayReference, true, undefined, undefined, "pay_async_1");
    let paymentRow = await prisma.payment.findUnique({ where: { id: dbPayment.id } });
    expect(paymentRow.gatewayPaymentId).toBe("pay_async_1");

    // A provider that settles asynchronously leaves the refund APPROVED: the
    // reservation was submitted to the gateway, so only the webhook may settle it.
    const originalProvider = (boundary as any).paymentProvider;
    (boundary as any).paymentProvider = {
      refundPayment: async () => ({ gatewayRefundReference: "rfnd_db_1", status: "PROCESSING" })
    };
    let refundRequestId: string;
    try {
      const requested = await frontend.refundPayment(payment.id, 40, "Async return");
      expect(requested.status).toBe("REFUND_REQUESTED");

      let refundRow = await prisma.refund.findFirst({ where: { paymentId: payment.id } });
      expect(refundRow.status).toBe("APPROVED");
      expect(refundRow.amount.toNumber()).toBe(40);
      refundRequestId = refundRow.id;

      // The reversal is deferred while the gateway processes the refund
      paymentRow = await prisma.payment.findUnique({ where: { id: dbPayment.id } });
      expect(paymentRow.status).toBe("REFUND_REQUESTED");
      expect(paymentRow.gatewayPaymentId).toBe("pay_async_1");
      const untouchedInvoice = await frontend.getInvoice(invoice.id);
      expect(untouchedInvoice.status).toBe("PAID");
    } finally {
      (boundary as any).paymentProvider = originalProvider;
    }

    // The refund.processed webhook settles the refund and reverses the ledger
    const settled = await boundary.processRefundWebhook(payment.id, refundRequestId!, true);
    expect(settled.status).toBe("CONFIRMED");

    const refundRow = await prisma.refund.findFirst({ where: { paymentId: payment.id } });
    expect(refundRow.status).toBe("COMPLETED");
    paymentRow = await prisma.payment.findUnique({ where: { id: dbPayment.id } });
    expect(paymentRow.gatewayPaymentId).toBe("pay_async_1");

    const reopenedInvoice = await frontend.getInvoice(invoice.id);
    expect(reopenedInvoice.status).toBe("PARTIALLY_PAID");
    const arEntry = await prisma.receivableEntry.findFirst({ where: { invoiceId: invoice.id } });
    expect(arEntry.remainingAmount.toNumber()).toBe(40);
  });

  it("serializes concurrent refund reservations across independent database connections", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `refund_race_${Date.now()}@example.com`;
    const user = await frontend.signUp(email, "password123", "Refund Race Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Race Shop", `refund-race-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Race Rita",
      customerNumber: `CUST-RACE-${Date.now()}`,
      primaryContact: { name: "Race Rita", email: "rita-race@example.com" },
      billingAddress: { line1: "3 Race Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });
    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-RACE-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Race Services", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    const payment = await frontend.collectPayment(invoice.id);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    await boundary.processPaymentWebhook(dbPayment.gatewayReference, true, undefined, undefined, "pay_race_1");

    // A second boundary opens its own Prisma pool, so the two refunds below run
    // in independent transactions/connections rather than sharing one process.
    const secondRuntime = new RuntimeFactory();
    secondRuntime.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));
    secondRuntime.health.registerCheck("backend", async () => ({ name: "backend", healthy: true } as any));
    const provider = {
      refundCalls: 0,
      refundPayment: async () => {
        provider.refundCalls += 1;
        return { gatewayRefundReference: `rfnd_race_${provider.refundCalls}`, status: "PROCESSING" as const };
      }
    };
    const secondBoundary = new AcosIntegrationBoundary(new Logger("AcosDbBoundaryRace", writer), secondRuntime, {
      paymentProvider: provider as any
    });
    await secondBoundary.connect("test", dbUrl, { allowInProcessBus: true });

    const originalProvider = (boundary as any).paymentProvider;
    (boundary as any).paymentProvider = provider;
    try {
      // Both requests pass the pre-flight cap check against the same confirmed
      // payment, so only the row lock and committed reservation can arbitrate.
      const [first, second] = await Promise.allSettled([
        boundary.refundPayment(user.id, payment.id, 100, "Concurrent A"),
        secondBoundary.refundPayment(user.id, payment.id, 100, "Concurrent B")
      ]);

      const fulfilled = [first, second].filter((r) => r.status === "fulfilled");
      const rejected = [first, second].filter((r) => r.status === "rejected");
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason.message).toMatch(/cannot exceed payment amount/);
      expect(provider.refundCalls).toBe(1);

      const refundRows = await prisma.refund.findMany({ where: { paymentId: payment.id } });
      expect(refundRows).toHaveLength(1);
      expect(refundRows[0].status).toBe("APPROVED");
    } finally {
      (boundary as any).paymentProvider = originalProvider;
      await secondBoundary.disconnect();
    }
  });

  it("sweeps stale reservations written under the reserve-before-submit protocol only", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `refund_sweep_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Refund Sweep Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Sweep Shop", `refund-sweep-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Sweep Sam",
      customerNumber: `CUST-SWEEP-${Date.now()}`,
      primaryContact: { name: "Sweep Sam", email: "sam-sweep@example.com" },
      billingAddress: { line1: "4 Sweep Way", city: "Metropolis", state: "NY", country: "USA", postalCode: "10001" }
    });
    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-SWEEP-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Sweep Services", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    const payment = await frontend.collectPayment(invoice.id);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    await boundary.processPaymentWebhook(dbPayment.gatewayReference, true, undefined, undefined, "pay_sweep_1");

    const originalProvider = (boundary as any).paymentProvider;
    (boundary as any).paymentProvider = {
      refundPayment: async () => {
        throw new RefundOutcomeUnknownError("Razorpay refund outcome is unknown: connection reset");
      }
    };
    try {
      const pending = await frontend.refundPayment(payment.id, 40, "Sweep probe");
      expect(pending.status).toBe("REFUND_REQUESTED");

      const reserved = await prisma.refund.findFirst({ where: { paymentId: payment.id } });
      expect(reserved.status).toBe("APPROVED");
      expect(reserved.submissionProtocol).toBe(1);

      // Simulate a crash between the reservation commit and the submission
      // marker: the row is provably never submitted and can be reclaimed.
      const staleCreatedAt = new Date(Date.now() - 20 * 60 * 1000);
      await prisma.refund.update({
        where: { id: reserved.id },
        data: { status: "REQUESTED", createdAt: staleCreatedAt }
      });

      expect(await boundary.sweepStaleRefundReservations()).toBe(1);
      const released = await prisma.refund.findUnique({ where: { id: reserved.id } });
      expect(released.status).toBe("REJECTED");
      const releasedPayment = await prisma.payment.findUnique({ where: { id: dbPayment.id } });
      expect(releasedPayment.status).toBe("CONFIRMED");

      // A pre-upgrade row keeps the column default: it may already have
      // reached the gateway, so the sweep must never release it automatically.
      const legacy = await prisma.refund.create({
        data: {
          id: `legacy_refund_${Date.now()}`,
          paymentId: dbPayment.id,
          organizationId: dbPayment.organizationId,
          invoiceId: invoice.id,
          amount: 10,
          currency: "USD",
          status: "REQUESTED",
          reason: "Legacy reservation",
          createdAt: staleCreatedAt
        }
      });
      expect(legacy.submissionProtocol).toBe(0);
      expect(await boundary.sweepStaleRefundReservations()).toBe(0);
      const untouched = await prisma.refund.findUnique({ where: { id: legacy.id } });
      expect(untouched.status).toBe("REQUESTED");
    } finally {
      (boundary as any).paymentProvider = originalProvider;
    }
  });

  it("stores monetary amounts without binary floating point drift", async () => {
    if (!isDbAvailable) {
      return;
    }

    // 3 x 0.1 is 0.30000000000000004 in float arithmetic. The domain computes it
    // as 30 minor units, so the column has to hand it back as exactly 0.3.
    const email = `money_valid_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Money Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Money Shop", `money-shop-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Decimal Dan",
      customerNumber: `CUST-MONEY-${Date.now()}`,
      primaryContact: {
        name: "Decimal Dan",
        email: "dan@example.com",
        phone: "+1-555-0110"
      },
      billingAddress: {
        line1: "1 Minor Unit Way",
        city: "Metropolis",
        state: "NY",
        country: "USA",
        postalCode: "10001"
      }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-MONEY-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Thirds of a dollar", quantity: 3, unitPrice: 0.1, taxRate: 0 }]
    });

    const prisma = (boundary as any).prismaClient;
    const row = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { lineItems: true }
    });

    expect(row.lineItems).toHaveLength(1);
    expect(row.lineItems[0].price.toString()).toBe("0.1");
    expect(row.lineItems[0].amount.toString()).toBe("0.3");
    expect(row.totalAmount.toString()).toBe("0.3");
    expect(row.lineItems[0].price.toNumber()).toBe(0.1);
    expect(row.totalAmount.toNumber()).toBe(0.3);
  });

  it("rolls back confirmation and reconciliation when the final write fails", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `webhook_atomic_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Atomic Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Atomic Shop", `atomic-shop-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Ada Atomic",
      customerNumber: `CUST-ATOMIC-${Date.now()}`,
      primaryContact: {
        name: "Ada Atomic",
        email: "ada@example.com",
        phone: "+1-555-0120"
      },
      billingAddress: {
        line1: "9 Commit Way",
        city: "Metropolis",
        state: "NY",
        country: "USA",
        postalCode: "10001"
      }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-ATOMIC-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Atomic Services", quantity: 1, unitPrice: 100, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    await frontend.collectPayment(invoice.id);
    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    const gatewayRef = dbPayment.gatewayReference;

    // The payment row is written last, after the invoice has already been
    // reconciled. Failing that write used to leave the invoice committed as
    // PAID with its event published and the payment still processing.
    const originalSave = boundary.paymentRepository.save.bind(boundary.paymentRepository);
    boundary.paymentRepository.save = async () =>
      Result.fail(ResultError.unexpected("injected payment write failure"));

    try {
      await expect(boundary.processPaymentWebhook(gatewayRef, true)).rejects.toThrow(
        /injected payment write failure/
      );
    } finally {
      boundary.paymentRepository.save = originalSave;
    }

    const invoiceRow = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(invoiceRow.status).toBe("ISSUED");

    const paidEvent = await prisma.outboxEvent.findFirst({
      where: { eventType: "InvoicePaid", aggregateId: invoice.id }
    });
    expect(paidEvent).toBeNull();

    const paymentRow = await prisma.payment.findUnique({ where: { id: dbPayment.id } });
    expect(paymentRow.status).toBe("PROCESSING");

    // The receivable ledger shares the transaction, so the rolled-back
    // confirmation must not leave an account or entry behind.
    const arRow = await prisma.receivableAccount.findFirst({
      where: { customerId: invoice.customerId }
    });
    expect(arRow).toBeNull();
  });

  it("publishes a declined payment through the outbox", async () => {
    if (!isDbAvailable) {
      return;
    }

    const email = `webhook_declined_${Date.now()}@example.com`;
    await frontend.signUp(email, "password123", "Declined Merchant");
    await frontend.login(email, "password123");
    await frontend.onboardBusiness("Declined Shop", `declined-shop-${Date.now()}`, "USD");

    const customer = await frontend.createCustomer({
      name: "Dana Declined",
      customerNumber: `CUST-DECLINED-${Date.now()}`,
      primaryContact: {
        name: "Dana Declined",
        email: "dana@example.com",
        phone: "+1-555-0130"
      },
      billingAddress: {
        line1: "7 Decline Ave",
        city: "Metropolis",
        state: "NY",
        country: "USA",
        postalCode: "10001"
      }
    });

    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-DECLINED-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [{ description: "Declined Services", quantity: 1, unitPrice: 40, taxRate: 0 }]
    });
    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);
    await frontend.collectPayment(invoice.id);

    const prisma = (boundary as any).prismaClient;
    const dbPayment = await prisma.payment.findFirst({ where: { invoiceId: invoice.id } });
    await frontend.simulateWebhook(dbPayment.gatewayReference, false);

    const paymentRow = await prisma.payment.findUnique({ where: { id: dbPayment.id } });
    expect(paymentRow.status).toBe("FAILED");

    const failedEvt = await prisma.outboxEvent.findFirst({
      where: { eventType: "PaymentFailed", aggregateId: dbPayment.id }
    });
    expect(failedEvt).toBeDefined();
    expect(failedEvt.processed).toBe(true);

    const invoiceRow = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(invoiceRow.status).toBe("ISSUED");
  });

  it("backs off, caps, and dead-letters undeliverable outbox events", async () => {
    if (!isDbAvailable) {
      return;
    }

    const prisma = (boundary as any).prismaClient;
    const eventType = `acos.outbox.retry_probe.${Date.now()}`;
    const handler = {
      handle: async () => {
        throw new Error("probe delivery failure");
      }
    };
    boundary.eventBus.subscribe(eventType, handler as any);

    try {
      const row = await prisma.outboxEvent.create({
        data: {
          eventType,
          aggregateId: "retry-probe",
          payload: JSON.stringify({ metadata: { aggregateId: "retry-probe" }, eventName: eventType }),
          processed: false
        }
      });

      await boundary.processOutboxAsynchronously();

      const afterFirstFailure = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(afterFirstFailure.processed).toBe(false);
      expect(afterFirstFailure.retryCount).toBe(1);
      expect(afterFirstFailure.lastError).toContain("probe delivery failure");
      expect(afterFirstFailure.nextAttemptAt).not.toBeNull();
      expect(afterFirstFailure.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
      expect(afterFirstFailure.deadLetteredAt).toBeNull();

      // A drain before the backoff elapses must leave the row untouched.
      await boundary.processOutboxAsynchronously();
      const afterEarlyDrain = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(afterEarlyDrain.retryCount).toBe(1);

      // Put the row on its last allowed attempt; the next failure dead-letters it.
      await prisma.outboxEvent.update({
        where: { id: row.id },
        data: { retryCount: OUTBOX_MAX_ATTEMPTS - 1, nextAttemptAt: null }
      });
      await boundary.processOutboxAsynchronously();

      const deadLettered = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(deadLettered.processed).toBe(false);
      expect(deadLettered.retryCount).toBe(OUTBOX_MAX_ATTEMPTS);
      expect(deadLettered.deadLetteredAt).not.toBeNull();
      expect(deadLettered.nextAttemptAt).toBeNull();

      // Dead-lettered rows are never delivered again.
      await boundary.processOutboxAsynchronously();
      const afterFinalDrain = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(afterFinalDrain.retryCount).toBe(OUTBOX_MAX_ATTEMPTS);
    } finally {
      boundary.eventBus.unsubscribe(eventType, handler as any);
      await prisma.outboxEvent.deleteMany({ where: { eventType } });
    }
  });

  it("claims outbox rows so two drainers deliver each event once", async () => {
    if (!isDbAvailable) {
      return;
    }

    const prisma = (boundary as any).prismaClient;
    const eventType = `acos.outbox.claim_probe.${Date.now()}`;
    let delivered = 0;
    const handler = {
      handle: async () => {
        delivered++;
      }
    };
    boundary.eventBus.subscribe(eventType, handler as any);

    const runtimeFactory2 = new RuntimeFactory();
    runtimeFactory2.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));
    runtimeFactory2.health.registerCheck("backend", async () => ({
      name: "backend",
      healthy: true
    } as any));
    const second = new AcosIntegrationBoundary(new Logger("AcosDbBoundarySecond", writer), runtimeFactory2);

    try {
      await second.connect("test", dbUrl, { allowInProcessBus: true });

      const row = await prisma.outboxEvent.create({
        data: {
          eventType,
          aggregateId: "claim-probe",
          payload: JSON.stringify({ metadata: { aggregateId: "claim-probe" }, eventName: eventType }),
          processed: false
        }
      });

      await Promise.all([
        boundary.processOutboxAsynchronously(),
        second.processOutboxAsynchronously()
      ]);

      const after = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(after.processed).toBe(true);
      expect(after.lockedBy).toBeNull();
      expect(after.lockedUntil).toBeNull();
      expect(delivered).toBe(1);
    } finally {
      boundary.eventBus.unsubscribe(eventType, handler as any);
      await second.disconnect();
      await prisma.outboxEvent.deleteMany({ where: { eventType } });
    }
  });

  it("queues a second drain behind the running pass instead of skipping its rows", async () => {
    if (!isDbAvailable) {
      return;
    }

    const prisma = (boundary as any).prismaClient;
    const eventType = `acos.outbox.drain_wait_probe.${Date.now()}`;
    const delivered: string[] = [];

    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let markEntered!: () => void;
    const entered = new Promise<void>((resolve) => {
      markEntered = resolve;
    });

    const handler = {
      handle: async (event: any) => {
        delivered.push(event.getAggregateId());
        if (delivered.length === 1) {
          markEntered();
          await firstGate;
        }
      }
    };
    boundary.eventBus.subscribe(eventType, handler as any);

    try {
      const firstRow = await prisma.outboxEvent.create({
        data: {
          eventType,
          aggregateId: "first",
          payload: JSON.stringify({ metadata: { aggregateId: "first" }, eventName: eventType }),
          processed: false
        }
      });

      // Start a pass and hold it mid-delivery, so the row below commits while it runs.
      const firstDrain = boundary.processOutboxAsynchronously();
      await entered;

      const secondRow = await prisma.outboxEvent.create({
        data: {
          eventType,
          aggregateId: "second",
          payload: JSON.stringify({ metadata: { aggregateId: "second" }, eventName: eventType }),
          processed: false
        }
      });
      const secondDrain = boundary.processOutboxAsynchronously();

      releaseFirst();
      await Promise.all([firstDrain, secondDrain]);

      const [firstAfter, secondAfter] = await Promise.all([
        prisma.outboxEvent.findUnique({ where: { id: firstRow.id } }),
        prisma.outboxEvent.findUnique({ where: { id: secondRow.id } })
      ]);
      expect(firstAfter.processed).toBe(true);
      expect(
        secondAfter.processed,
        "a drain requested while another pass runs must publish the row committed during that pass"
      ).toBe(true);
      expect(delivered).toEqual(["first", "second"]);
    } finally {
      releaseFirst();
      boundary.eventBus.unsubscribe(eventType, handler as any);
      await prisma.outboxEvent.deleteMany({ where: { eventType } });
    }
  });

  it("retries a failed delivery from the scheduled timer without another drain call", async () => {
    if (!isDbAvailable) {
      return;
    }

    const prisma = (boundary as any).prismaClient;
    const eventType = `acos.outbox.retry_timer_probe.${Date.now()}`;
    const handler = {
      handle: async () => {
        throw new Error("timer probe failure");
      }
    };
    boundary.eventBus.subscribe(eventType, handler as any);

    try {
      const row = await prisma.outboxEvent.create({
        data: {
          eventType,
          aggregateId: "timer-probe",
          payload: JSON.stringify({ metadata: { aggregateId: "timer-probe" }, eventName: eventType }),
          processed: false
        }
      });

      // The first pass arms the retry timer from inside its own drain context.
      await boundary.processOutboxAsynchronously();
      const firstAttempt = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(firstAttempt.retryCount).toBe(1);

      // Only the timer can retry from here; no further drain is requested.
      const deadline = Date.now() + 4_000;
      let afterTimer = firstAttempt;
      while (Date.now() < deadline) {
        afterTimer = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
        if (afterTimer.retryCount >= 2) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      expect(
        afterTimer.retryCount,
        "the scheduled retry timer must run its own drain instead of inheriting the pass that armed it"
      ).toBeGreaterThanOrEqual(2);
    } finally {
      boundary.eventBus.unsubscribe(eventType, handler as any);
      await prisma.outboxEvent.deleteMany({ where: { eventType } });
    }
  });
});
