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
});
