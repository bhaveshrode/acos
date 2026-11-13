import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Logger, LogEntry, OrganizationId, CustomerId } from "acos-backend";
import type { LogWriter } from "acos-backend";
import { Mediator } from "acos-backend/application";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";
import { PrismaClient } from "@prisma/client";
import { InMemoryEventBus, EventMetadata } from "acos-backend";
import type { IDomainEvent } from "acos-backend";
import { OutboxEventBus } from "../src/integration/OutboxEventBus.js";

describe("ACOS Merchant — Track D4 Restart & Recovery Validation Suite", () => {
  const logs: LogEntry[] = [];
  const writer: LogWriter = (entry) => {
    logs.push(entry);
  };

  const dbUrl = process.env.MERCHANT_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/acos?schema=public";
  
  let boundary: AcosIntegrationBoundary;
  let backend: MerchantBackend;
  let frontend: MerchantFrontend;
  let isDbAvailable = false;

  const publishProbe = async (eventName: string): Promise<void> => {
    const bus = new OutboxEventBus(new InMemoryEventBus(), boundary);
    const event: IDomainEvent = {
      eventName,
      metadata: new EventMetadata({ aggregateId: eventName, aggregateType: "RecoveryProbe" }),
      occurredOn: new Date(),
      getAggregateId: () => eventName
    };
    await bus.publish(event);
  };

  const waitFor = async (predicate: () => Promise<boolean>, timeoutMs = 2000): Promise<boolean> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await predicate()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return predicate();
  };

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
      console.warn("PostgreSQL database is not reachable. Skipping restart & recovery validation tests.");
      return;
    }
  });

  it("should survive application restarts, preserving sessions, idempotency records, and outbox event queues", async () => {
    if (!isDbAvailable) {
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
      port: 9006, // Different port to avoid collision
      env: "test-recovery",
      acosEndpoint: "http://localhost:3000",
      dbUrl: dbUrl,
      enableAcosFeatures: true
    });

    // 4. Initial Start
    const boundaryLogger = new Logger("AcosDbBoundary", writer);
    boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
    backend = new MerchantBackend(config, boundary, writer);
    frontend = new MerchantFrontend(backend, writer);

    await boundary.connect("test", dbUrl);
    await backend.start();

    // 5. Setup state: User signup and login
    const email = `recovery_${Date.now()}@example.com`;
    const password = "password123";
    const name = "Recovery Merchant";

    const user = await frontend.signUp(email, password, name);
    expect(user.email).toBe(email);

    await frontend.login(email, password);
    const tokenBeforeRestart = frontend.getSessionToken();
    expect(tokenBeforeRestart).toBeDefined();

    // Onboard business
    const biz = await frontend.onboardBusiness(
      "Recovery Shop",
      `rec-shop-${Date.now()}`,
      "USD",
      "E-Commerce",
      "India",
      "ops@recovery.test"
    );
    expect(biz.name).toBe("Recovery Shop");
    expect(biz.businessType).toBe("E-Commerce");

    // Create customer
    const customer = await frontend.createCustomer({
      name: "Bob Recovery",
      customerNumber: `CUST-REC-${Date.now()}`,
      primaryContact: {
        name: "Bob Recovery",
        email: "bob@example.com",
        phone: "+1-555-0299"
      },
      billingAddress: {
        line1: "123 Recovery St",
        city: "Metropolis",
        state: "NY",
        country: "USA",
        postalCode: "10001"
      }
    });
    expect(customer.name).toBe("Bob Recovery");

    // 6. Create idempotency record
    const idempotencyKey = `idemp-rec-${Date.now()}`;
    const idempResponse = await backend.handleRequest("POST", "/auth/signup", {
      email: `idemp_rec_user_${Date.now()}@example.com`,
      password: "pass",
      name: "Idemp Rec"
    }, { "Idempotency-Key": idempotencyKey });
    expect(idempResponse.status).toBe(201);

    // 7. Create a DRAFT invoice that is issued and sent after the restart
    const invoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-REC-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [
        { description: "Recovery Services", quantity: 1, unitPrice: 150, taxRate: 0 }
      ]
    });
    expect(invoice.status).toBe("DRAFT");

    // 7b. Issue and send a second invoice before the restart. SENT used to be
    // held in an in-memory map, so it disappeared with the process.
    const deliveredInvoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-REC-SENT-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [
        { description: "Delivered Services", quantity: 1, unitPrice: 75, taxRate: 0 }
      ]
    });
    await frontend.issueInvoice(deliveredInvoice.id);
    await frontend.sendInvoice(deliveredInvoice.id);

    // 7c. Collect a payment before the restart. The callback the gateway sends
    // afterwards carries only its reference, so resolving the payment must not
    // depend on the process that initiated it.
    const payableInvoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-REC-PAY-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [
        { description: "Payable Services", quantity: 1, unitPrice: 120, taxRate: 0 }
      ]
    });
    await frontend.issueInvoice(payableInvoice.id);
    await frontend.sendInvoice(payableInvoice.id);
    const pendingPayment = await frontend.collectPayment(payableInvoice.id);
    expect(pendingPayment.status).toBe("PROCESSING");

    const preRestartPayment = await boundary.prismaClient.payment.findFirst({
      where: { invoiceId: payableInvoice.id }
    });
    expect(preRestartPayment).toBeDefined();
    const callbackReference = preRestartPayment.gatewayReference;
    expect(callbackReference).toBeDefined();

    // 7d. Confirm an overpayment before the restart so the receivable ledger
    // holds both a settled entry and a customer credit across the boundary.
    const overpaidInvoice = await frontend.createInvoice({
      customerId: customer.id,
      invoiceNumber: `INV-REC-AR-${Date.now()}`,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      lines: [
        { description: "Overpaid Services", quantity: 1, unitPrice: 100, taxRate: 0 }
      ]
    });
    await frontend.issueInvoice(overpaidInvoice.id);
    await frontend.sendInvoice(overpaidInvoice.id);
    await frontend.collectPayment(overpaidInvoice.id, 130);

    const overpaidPayment = await boundary.prismaClient.payment.findFirst({
      where: { invoiceId: overpaidInvoice.id }
    });
    await frontend.simulateWebhook(overpaidPayment.gatewayReference, true);

    const arBeforeRestart = await boundary.accountsReceivableRepository.findByCustomer(
      OrganizationId.from(overpaidInvoice.organizationId),
      CustomerId.from(customer.id)
    );
    expect(arBeforeRestart.isSuccess).toBe(true);
    expect(arBeforeRestart.value.getCreditBalance("USD").amount).toBe(30);

    // Seed an outbox record through the production writer. Counting the whole
    // table only passed when another spec file happened to run first and leave
    // rows behind, so the suite passed or failed depending on file scheduling.
    const preRestartProbe = `acos.recovery.probe.${Date.now()}.before`;
    await publishProbe(preRestartProbe);
    expect(await boundary.prismaClient.outboxEvent.count({ where: { eventType: preRestartProbe } })).toBe(1);

    // 8. SIMULATE RESTART (Stop backend and boundary, then rebuild them)
    await backend.stop();
    await boundary.disconnect();

    const runtimeFactory2 = new RuntimeFactory();
    const backendMediator2 = new Mediator();
    runtimeFactory2.registry.register(new SubsystemDescriptor("backend", [], backendMediator2));
    runtimeFactory2.health.registerCheck("backend", async () => ({
      name: "backend",
      healthy: true
    } as any));

    boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory2);
    backend = new MerchantBackend(config, boundary, writer);
    frontend = new MerchantFrontend(backend, writer);

    // Restore session token to simulate client retaining its cookie/header
    (frontend as any).sessionToken = tokenBeforeRestart;

    await boundary.connect("test", dbUrl);
    await backend.start();

    // 9. Verify Active Session Survival
    const me = await frontend.queryMe();
    expect(me.email).toBe(email);

    // 9a. The business profile is stored with the organization, so a boundary
    // with no process memory must still resolve the owner's business and metadata.
    const restoredBusiness = await frontend.queryBusiness();
    expect(restoredBusiness.id).toBe(biz.id);
    expect(restoredBusiness.businessType).toBe("E-Commerce");
    expect(restoredBusiness.country).toBe("India");
    expect(restoredBusiness.contactInfo).toBe("ops@recovery.test");

    const profileRow = await boundary.prismaClient.businessProfile.findUnique({
      where: { organizationId: biz.id }
    });
    expect(profileRow?.businessType).toBe("E-Commerce");

    // 9b. Verify the invoice sent before the restart still reads as SENT
    const survivedSent = await frontend.getInvoice(deliveredInvoice.id);
    expect(survivedSent.status).toBe("SENT");

    // 9c. Deliver the callback issued before the restart. Only the reference
    // travels with it, so this proves confirmation survives a process boundary.
    const confirmed = await frontend.simulateWebhook(callbackReference, true);
    expect(confirmed.status).toBe("CONFIRMED");

    const paidInvoice = await frontend.getInvoice(payableInvoice.id);
    expect(paidInvoice.status).toBe("PAID");

    const confirmedPaymentRow = await boundary.prismaClient.payment.findUnique({
      where: { id: preRestartPayment.id }
    });
    expect(confirmedPaymentRow.status).toBe("CONFIRMED");

    const confirmedEventProcessed = await waitFor(async () => {
      const record = await boundary.prismaClient.outboxEvent.findFirst({
        where: { eventType: "PaymentConfirmed", aggregateId: preRestartPayment.id }
      });
      return record?.processed === true;
    });
    expect(confirmedEventProcessed).toBe(true);

    // 9d. The receivable ledger lives in the database now, so a fresh boundary
    // must still see the settled entry and the customer credit from 7d.
    const arAfterRestart = await boundary.accountsReceivableRepository.findByCustomer(
      OrganizationId.from(overpaidInvoice.organizationId),
      CustomerId.from(customer.id)
    );
    expect(arAfterRestart.isSuccess).toBe(true);
    const settledEntry = arAfterRestart.value.entries.find(
      (entry) => entry.invoiceId.value === overpaidInvoice.id
    );
    expect(settledEntry).toBeDefined();
    expect(settledEntry!.remainingBalance.amount).toBe(0);
    expect(arAfterRestart.value.getCreditBalance("USD").amount).toBe(30);

    // 10. Verify Idempotency Record Survival
    // Replaying exact signup request should return the cached response (201) instead of 409
    const replayedResponse = await backend.handleRequest("POST", "/auth/signup", {
      email: `idemp_rec_user_${Date.now()}@example.com`,
      password: "pass",
      name: "Idemp Rec"
    }, { "Idempotency-Key": idempotencyKey });
    expect(replayedResponse.status).toBe(201);
    const firstBody = typeof idempResponse.body === "string" ? JSON.parse(idempResponse.body) : idempResponse.body;
    const replayedBody = typeof replayedResponse.body === "string" ? JSON.parse(replayedResponse.body) : replayedResponse.body;
    expect(replayedBody.id).toBe(firstBody.id);

    // 11. Verify Outbox Event Queue is active and processes events post-restart
    const survivingProbe = await boundary.prismaClient.outboxEvent.count({
      where: { eventType: preRestartProbe }
    });
    expect(survivingProbe).toBe(1);

    const postRestartProbe = `acos.recovery.probe.${Date.now()}.after`;
    await publishProbe(postRestartProbe);
    const processedAfterRestart = await waitFor(async () => {
      const record = await boundary.prismaClient.outboxEvent.findFirst({
        where: { eventType: postRestartProbe }
      });
      return record?.processed === true;
    });
    expect(processedAfterRestart).toBe(true);

    await frontend.issueInvoice(invoice.id);
    await frontend.sendInvoice(invoice.id);

    const sentInvoice = await frontend.getInvoice(invoice.id);
    expect(sentInvoice.status).toBe("SENT");

    // Clean up
    await backend.stop();
    await boundary.disconnect();
  });
});
