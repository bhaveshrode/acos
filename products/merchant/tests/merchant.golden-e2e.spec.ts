import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Logger, LogWriter } from "../../../backend/src/foundation/logging/Logger.js";
import { LogEntry } from "../../../backend/src/foundation/logging/LogEntry.js";
import { Mediator } from "../../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";

describe("ACOS Merchant — Golden End-to-End Commerce Flow (Phase 9)", () => {
  const logs: LogEntry[] = [];
  const writer: LogWriter = (entry) => {
    logs.push(entry);
  };

  let boundary: AcosIntegrationBoundary;
  let backend: MerchantBackend;
  let frontend: MerchantFrontend;

  beforeAll(async () => {
    // 1. Setup ACOS Runtime Subsystems Mock Factory
    const runtimeFactory = new RuntimeFactory();
    const backendMediator = new Mediator();

    runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], backendMediator));
    runtimeFactory.health.registerCheck("backend", async () => ({
      name: "backend",
      healthy: true
    } as any));

    // 2. Load config
    const config = MerchantConfig.loadFromEnv({
      port: 9002, // Different port for E2E
      env: "test",
      acosEndpoint: "http://localhost:3000",
      dbUrl: "postgresql://localhost:5432/merchant_test",
      enableAcosFeatures: true
    });

    const boundaryLogger = new Logger("AcosBoundary", writer);
    boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
    backend = new MerchantBackend(config, boundary, writer);
    frontend = new MerchantFrontend(backend, writer);

    // Bootstrap
    await boundary.connect("test");
    await backend.start();
  });

  afterAll(async () => {
    await backend.stop();
    await boundary.disconnect();
  });

  it("should successfully execute a complete merchant commerce lifecycle from registration through payment, reconciliation, event propagation, and dashboard update", async () => {
    const password = "PasswordPlaintext123!";
    const email = "bob@example.com";
    const name = "Bob Merchant";

    // ----------------------------------------------------
    // STEP 1: Merchant Registration (Sign Up & Login)
    // ----------------------------------------------------
    const signUpResult = await frontend.signUp(email, password, name);
    expect(signUpResult.email).toBe(email);
    expect(signUpResult.name).toBe(name);

    const loginResult = await frontend.login(email, password);
    expect(loginResult.token).toBeDefined();
    expect(loginResult.user.email).toBe(email);

    const meProfile = await frontend.queryMe();
    expect(meProfile.email).toBe(email);

    // ----------------------------------------------------
    // STEP 2: Business Onboarding
    // ----------------------------------------------------
    const business = await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
    expect(business.id).toBeDefined();
    expect(business.name).toBe("Bob Shop");
    expect(business.slug).toBe("bob-shop");

    const queriedBusiness = await frontend.queryBusiness();
    expect(queriedBusiness.id).toBe(business.id);

    // ----------------------------------------------------
    // STEP 3: Customer Creation
    // ----------------------------------------------------
    const customer = await frontend.createCustomer({
      customerNumber: "CUST-BOB-1",
      name: "Bob's Customer",
      primaryContact: { name: "John", email: "john@bobc.com" },
      billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
    });
    expect(customer.id).toBeDefined();
    expect(customer.customerNumber).toBe("CUST-BOB-1");

    // ----------------------------------------------------
    // STEP 4: Invoice Creation (DRAFT)
    // ----------------------------------------------------
    const invoicePayload = {
      customerId: customer.id,
      invoiceNumber: "INV-BOB-001",
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lines: [
        {
          description: "Consulting Services",
          quantity: 5,
          unitPrice: 100,
          taxRate: 0
        }
      ]
    };

    const invoiceDraft = await frontend.createInvoice(invoicePayload);
    expect(invoiceDraft.id).toBeDefined();
    expect(invoiceDraft.status).toBe("DRAFT");
    expect(invoiceDraft.grandTotal).toBe(500);

    // ----------------------------------------------------
    // STEP 5: Invoice Lifecycle (DRAFT -> ISSUED -> SENT)
    // ----------------------------------------------------
    const invoiceIssued = await frontend.issueInvoice(invoiceDraft.id);
    expect(invoiceIssued.status).toBe("ISSUED");

    const invoiceSent = await frontend.sendInvoice(invoiceDraft.id);
    expect(invoiceSent.status).toBe("SENT");

    // ----------------------------------------------------
    // STEP 6: Payment Collection (PROCESSING)
    // ----------------------------------------------------
    const payment = await frontend.collectPayment(invoiceDraft.id);
    expect(payment.id).toBeDefined();
    expect(payment.amount).toBe(500);
    expect(payment.status).toBe("PROCESSING");
    const queryRes = await boundary.paymentRepository.findById(
      await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
    );
    const gatewayReference = queryRes.value.gatewayReference!.value;
    expect(gatewayReference).toBeDefined();

    // ----------------------------------------------------
    // STEP 7: Populate Dashboard Cache (Initial State)
    // ----------------------------------------------------
    const dashboardInitial = await frontend.queryDashboard();
    expect(dashboardInitial.outstandingAmount).toBe(500); // SENT invoice is outstanding
    expect(dashboardInitial.paymentSummary.totalAmount).toBe(0);
    expect(backend.isDashboardCached(business.id)).toBe(true);

    // ----------------------------------------------------
    // STEP 8: Webhook Simulation, Reconciliation & Event Invalidation
    // ----------------------------------------------------
    // Simulating webhook payment confirmation triggers the ACOS Reconciliation flow,
    // transition the Payment -> CONFIRMED, the Invoice -> PAID, Accounts Receivable outstanding -> $0,
    // and publishes the InvoicePaid domain event which invalidates the dashboard query cache.
    const webhookRes = await frontend.simulateWebhook(gatewayReference, true);
    expect(webhookRes.status).toBe("CONFIRMED");

    // Assert that the dashboard query cache is invalidated reactively
    expect(backend.isDashboardCached(business.id)).toBe(false);

    // ----------------------------------------------------
    // STEP 9: Dashboard Refresh (Autoritative ACOS State)
    // ----------------------------------------------------
    const dashboardFinal = await frontend.queryDashboard();
    expect(dashboardFinal.outstandingAmount).toBe(0); // Fully paid, outstanding is 0
    expect(dashboardFinal.paymentSummary.totalAmount).toBe(500); // Confirmed payments received
    expect(dashboardFinal.paymentSummary.confirmedCount).toBe(1);
    expect(dashboardFinal.invoiceSummary.paidCount).toBe(1);

    // Verify recent activity logs contain the paid invoice and confirmed payment
    expect(dashboardFinal.recentInvoices).toHaveLength(1);
    expect(dashboardFinal.recentInvoices[0].invoiceNumber).toBe("INV-BOB-001");
    expect(dashboardFinal.recentInvoices[0].status).toBe("PAID");

    expect(dashboardFinal.recentPayments).toHaveLength(1);
    expect(dashboardFinal.recentPayments[0].reference).toBe(payment.reference);
    expect(dashboardFinal.recentPayments[0].status).toBe("CONFIRMED");
  });
});
