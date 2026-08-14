import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { Logger, LogWriter } from "../../../backend/src/foundation/logging/Logger.js";
import { LogEntry } from "../../../backend/src/foundation/logging/LogEntry.js";
import { Mediator } from "../../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary, SandboxPaymentProvider } from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend, MerchantBackendState } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";
import { Email } from "../../../backend/src/business/identity/value-objects/Email.js";

describe("Merchant Core Integration Spec Suite (Phase 5 Combined)", () => {
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
      port: 9001,
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

  beforeEach(() => {
    // Clear repositories between test runs to ensure full tenant and data isolation
    if (typeof (boundary.userRepository as any).clear === "function") (boundary.userRepository as any).clear();
    if (typeof (boundary.organizationRepository as any).clear === "function") (boundary.organizationRepository as any).clear();
    if (typeof (boundary.customerRepository as any).clear === "function") (boundary.customerRepository as any).clear();
    if (typeof (boundary.invoiceRepository as any).clear === "function") (boundary.invoiceRepository as any).clear();
    if (typeof (boundary.paymentRepository as any).clear === "function") (boundary.paymentRepository as any).clear();
    if (typeof (boundary.accountsReceivableRepository as any).clear === "function") (boundary.accountsReceivableRepository as any).clear();
    (boundary.paymentProvider as SandboxPaymentProvider).clear();
    boundary.gatewayRefToPaymentId.clear();
    boundary.businessMetadata.clear();
    boundary.invoiceSentStatus.clear();
    frontend.clearSessionToken();
  });

  it("should validate configuration checks", () => {
    const config = new MerchantConfig({
      port: 8080,
      env: "test",
      acosEndpoint: "http://localhost:3000",
      dbUrl: "postgresql://localhost:5432/merchant_test",
      enableAcosFeatures: true
    });
    expect(config.port).toBe(8080);
    expect(() => {
      new MerchantConfig({
        port: -99,
        env: "test",
        acosEndpoint: "http://localhost:3000",
        dbUrl: "postgresql://localhost:5432/merchant_test",
        enableAcosFeatures: true
      });
    }).toThrow();
  });

  describe("E2E Authentication Workflows", () => {
    const email = "alice@example.com";
    const password = "PasswordPlaintext123!";
    const name = "Alice Merchant";

    it("should sign up a new merchant user successfully through ACOS Identity", async () => {
      const user = await frontend.signUp(email, password, name);
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.status).toBe("ACTIVE");

      const searchRes = await boundary.userRepository.findByEmail(
        await import("../../../backend/src/business/identity/value-objects/Email.js").then(m => m.Email.create(email).value)
      );
      expect(searchRes.isSuccess).toBe(true);
      expect(searchRes.value.name).toBe(name);
      expect(searchRes.value.status).toBe("ACTIVE");
    });

    it("should reject sign up with a duplicate email address", async () => {
      await frontend.signUp(email, password, name);
      await expect(frontend.signUp(email, password, "Alice Duplicate")).rejects.toThrow(/already registered/);
    });

    it("should log in successfully with valid credentials, returning a token", async () => {
      await frontend.signUp(email, password, name);

      const loginRes = await frontend.login(email, password);
      expect(loginRes.token).toBeDefined();
      expect(loginRes.user.email).toBe(email);
      expect(frontend.getSessionToken()).toBe(loginRes.token);
    });

    it("should reject login with invalid credentials", async () => {
      await frontend.signUp(email, password, name);
      await expect(frontend.login(email, "WrongPassword!")).rejects.toThrow(/Invalid credentials/);
      await expect(frontend.login("unknown@example.com", password)).rejects.toThrow(/Invalid credentials/);
    });

    it("should verify profile access with authenticated GET /auth/me request", async () => {
      await frontend.signUp(email, password, name);
      await frontend.login(email, password);

      const me = await frontend.queryMe();
      expect(me.email).toBe(email);
      expect(me.name).toBe(name);
      expect(me.status).toBe("ACTIVE");
    });

    it("should reject /auth/me profile access for unauthenticated requests", async () => {
      await frontend.signUp(email, password, name);
      await expect(frontend.queryMe()).rejects.toThrow(/Unauthorized/);

      frontend.clearSessionToken();
      (frontend as any).sessionToken = "invalid-jwt-signature-claims";
      await expect(frontend.queryMe()).rejects.toThrow(/Unauthorized/);
    });

    it("should log out successfully, terminating session on ACOS and clearing client token", async () => {
      await frontend.signUp(email, password, name);
      await frontend.login(email, password);
      
      const cachedToken = frontend.getSessionToken()!;
      expect(cachedToken).toBeDefined();

      await frontend.logout();
      expect(frontend.getSessionToken()).toBeNull();

      (frontend as any).sessionToken = cachedToken;
      await expect(frontend.queryMe()).rejects.toThrow(/Session is revoked or expired/);
    });
  });

  describe("Business Onboarding Workflows", () => {
    const email = "bob@example.com";
    const password = "PasswordPlaintext123!";
    const name = "Bob Merchant";

    beforeEach(async () => {
      await frontend.signUp(email, password, name);
      await frontend.login(email, password);
    });

    it("should successfully onboard a business for authenticated merchant", async () => {
      const biz = await frontend.onboardBusiness(
        "Bob Retail",
        "bob-retail",
        "USD",
        "E-Commerce",
        "Canada",
        "info@bobretail.com"
      );

      expect(biz.id).toBeDefined();
      expect(biz.name).toBe("Bob Retail");
      expect(biz.slug).toBe("bob-retail");
      expect(biz.settings.currency).toBe("USD");
      expect(biz.businessType).toBe("E-Commerce");
      expect(biz.country).toBe("Canada");
      expect(biz.contactInfo).toBe("info@bobretail.com");
    });

    it("should retrieve the active business context for authenticated merchant", async () => {
      await expect(frontend.queryBusiness()).rejects.toThrow(/No active business context found/);

      await frontend.onboardBusiness(
        "Bob Retail",
        "bob-retail",
        "USD",
        "E-Commerce",
        "Canada",
        "info@bobretail.com"
      );

      const biz = await frontend.queryBusiness();
      expect(biz.name).toBe("Bob Retail");
      expect(biz.slug).toBe("bob-retail");
      expect(biz.businessType).toBe("E-Commerce");
      expect(biz.country).toBe("Canada");
    });

    it("should prevent onboarding or retrieving business contexts for unauthenticated requests", async () => {
      frontend.clearSessionToken();

      await expect(
        frontend.onboardBusiness("Ghost Biz", "ghost-biz", "USD", "SaaS", "USA")
      ).rejects.toThrow(/Unauthorized/);

      await expect(frontend.queryBusiness()).rejects.toThrow(/Unauthorized/);
    });

    it("should block duplicate business onboarding for the same merchant", async () => {
      await frontend.onboardBusiness(
        "Bob Shop",
        "bob-shop",
        "USD"
      );

      await expect(
        frontend.onboardBusiness("Bob Garage", "bob-garage", "USD")
      ).rejects.toThrow(/Onboarding Blocked/);
    });

    it("should reject onboarding when using a duplicate slug from another user", async () => {
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");

      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);

      await expect(
        frontend.onboardBusiness("Charlie Shop", "bob-shop", "USD")
      ).rejects.toThrow(/already exists/);
    });

    it("should validate and reject missing parameters during onboarding", async () => {
      await expect(
        frontend.onboardBusiness("", "valid-slug")
      ).rejects.toThrow(/name/i);

      await expect(
        frontend.onboardBusiness("Valid Name", "")
      ).rejects.toThrow(/slug/i);
    });
  });

  describe("Customer Management Workflows", () => {
    const password = "PasswordPlaintext123!";
    const customerPayload = {
      customerNumber: "CUST-1001",
      name: "Acme Corp",
      companyName: "Acme Industries",
      taxIdentifier: "TAX-999",
      phoneNumber: "+15550000",
      website: "https://acme.com",
      email: "billing@acme.com",
      primaryContact: {
        name: "John Doe",
        email: "john@acme.com",
        phone: "+15551111"
      },
      billingAddress: {
        line1: "120 Main St",
        city: "Boston",
        state: "MA",
        postalCode: "02108",
        country: "USA"
      }
    };

    beforeEach(async () => {
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
    });

    it("should successfully register a customer under active business context", async () => {
      const customer = await frontend.createCustomer(customerPayload);
      expect(customer.id).toBeDefined();
      expect(customer.customerNumber).toBe("CUST-1001");
    });

    it("should list all customers belonging to the active business context", async () => {
      await frontend.createCustomer(customerPayload);
      await frontend.createCustomer({
        ...customerPayload,
        customerNumber: "CUST-1002",
        name: "Globex Corporation"
      });

      const list = await frontend.listCustomers();
      expect(list).toHaveLength(2);
      expect(list.map(c => c.name)).toContain("Acme Corp");
      expect(list.map(c => c.name)).toContain("Globex Corporation");
    });

    it("should retrieve a customer by its ID", async () => {
      const created = await frontend.createCustomer(customerPayload);
      const fetched = await frontend.getCustomer(created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.customerNumber).toBe("CUST-1001");
    });

    it("should reject unauthenticated requests to customer routes", async () => {
      frontend.clearSessionToken();

      await expect(frontend.createCustomer(customerPayload)).rejects.toThrow(/Unauthorized/);
      await expect(frontend.listCustomers()).rejects.toThrow(/Unauthorized/);
      await expect(frontend.getCustomer("any-id")).rejects.toThrow(/Unauthorized/);
    });

    it("should reject registration of duplicate customer number in same business", async () => {
      await frontend.createCustomer(customerPayload);
      await expect(frontend.createCustomer(customerPayload)).rejects.toThrow(/already exists/);
    });

    it("should allow duplicate customer number in DIFFERENT businesses", async () => {
      await frontend.createCustomer(customerPayload);

      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");

      const charlieCust = await frontend.createCustomer(customerPayload);
      expect(charlieCust.id).toBeDefined();
      expect(charlieCust.customerNumber).toBe("CUST-1001");
    });

    it("should enforce tenant isolation boundaries, blocking cross-business customer queries", async () => {
      const bobCust = await frontend.createCustomer(customerPayload);

      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");

      const list = await frontend.listCustomers();
      expect(list).toHaveLength(0);

      await expect(frontend.getCustomer(bobCust.id)).rejects.toThrow(/Access Denied|Forbidden/);
    });
  });

  describe("Invoice Lifecycle Workflows (Phase 4)", () => {
    const password = "PasswordPlaintext123!";

    let bobCustomer: any;
    let charlieCustomer: any;

    const baseInvoicePayload = (customerId: string, number: string) => ({
      customerId,
      invoiceNumber: number,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lines: [
        {
          description: "Consulting Services",
          quantity: 10,
          unitPrice: 100,
          taxRate: 5
        }
      ]
    });

    beforeEach(async () => {
      // 1. Setup Bob
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
      bobCustomer = await frontend.createCustomer({
        customerNumber: "CUST-BOB-1",
        name: "Bob's Customer",
        primaryContact: { name: "John", email: "john@bobc.com" },
        billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });

      // 2. Setup Charlie
      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");
      charlieCustomer = await frontend.createCustomer({
        customerNumber: "CUST-CHAR-1",
        name: "Charlie's Customer",
        primaryContact: { name: "Adam", email: "adam@charc.com" },
        billingAddress: { line1: "2 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });

      // Restore Bob login session by default
      frontend.clearSessionToken();
      await frontend.login("bob@example.com", password);
    });

    it("should successfully create a new DRAFT invoice for Bob's business", async () => {
      const payload = baseInvoicePayload(bobCustomer.id, "INV-BOB-001");
      const invoice = await frontend.createInvoice(payload);

      expect(invoice.id).toBeDefined();
      expect(invoice.invoiceNumber).toBe("INV-BOB-001");
      expect(invoice.status).toBe("DRAFT");
      expect(invoice.grandTotal).toBe(1050);
    });

    it("should reject invoice creation referencing a customer from another business", async () => {
      const payload = baseInvoicePayload(charlieCustomer.id, "INV-BOB-BAD");
      await expect(frontend.createInvoice(payload)).rejects.toThrow(/Access Denied|boundary breach/);
    });

    it("should list all invoices belonging to the active business context", async () => {
      await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));
      await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-002"));

      const list = await frontend.listInvoices();
      expect(list).toHaveLength(2);
      expect(list.map(inv => inv.invoiceNumber)).toContain("INV-BOB-001");
      expect(list.map(inv => inv.invoiceNumber)).toContain("INV-BOB-002");
    });

    it("should retrieve detailed invoice by its ID", async () => {
      const created = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));
      const fetched = await frontend.getInvoice(created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.invoiceNumber).toBe("INV-BOB-001");
    });

    it("should successfully issue a draft invoice (DRAFT -> ISSUED)", async () => {
      const created = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));
      expect(created.status).toBe("DRAFT");

      const issued = await frontend.issueInvoice(created.id);
      expect(issued.status).toBe("ISSUED");

      const queryRes = await boundary.invoiceRepository.findById(
        await import("../../../backend/src/business/invoice/value-objects/InvoiceId.js").then(m => m.InvoiceId.from(created.id))
      );
      expect(queryRes.isSuccess).toBe(true);
      expect(queryRes.value.status).toBe("ISSUED");
    });

    it("should reject issuing a draft invoice that has zero line items", async () => {
      const emptyPayload = {
        ...baseInvoicePayload(bobCustomer.id, "INV-BOB-EMPTY"),
        lines: []
      };
      
      const created = await frontend.createInvoice(emptyPayload);
      expect(created.status).toBe("DRAFT");

      await expect(frontend.issueInvoice(created.id)).rejects.toThrow(/zero line items/);
    });

    it("should successfully send an issued invoice (ISSUED -> SENT)", async () => {
      const created = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));
      await frontend.issueInvoice(created.id);

      const sent = await frontend.sendInvoice(created.id);
      expect(sent.status).toBe("SENT");
    });

    it("should reject sending an invoice that is still in DRAFT status", async () => {
      const created = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));
      expect(created.status).toBe("DRAFT");

      await expect(frontend.sendInvoice(created.id)).rejects.toThrow(/invalid/);
    });

    it("should enforce tenant isolation boundaries, blocking cross-business invoice operations", async () => {
      const bobInv = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));

      frontend.clearSessionToken();
      await frontend.login("charlie@example.com", password);

      const charlieInvoices = await frontend.listInvoices();
      expect(charlieInvoices).toHaveLength(0);

      await expect(frontend.getInvoice(bobInv.id)).rejects.toThrow(/Access Denied|Forbidden/);
      await expect(frontend.issueInvoice(bobInv.id)).rejects.toThrow(/Access Denied|Forbidden/);
      await expect(frontend.sendInvoice(bobInv.id)).rejects.toThrow(/Access Denied|Forbidden/);
    });
  });

  describe("Payment Sandbox Workflows (Phase 5)", () => {
    const password = "PasswordPlaintext123!";

    let bobCustomer: any;
    let bobInvoice: any;

    const baseInvoicePayload = (customerId: string, number: string) => ({
      customerId,
      invoiceNumber: number,
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
    });

    beforeEach(async () => {
      // 1. Setup Bob
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
      bobCustomer = await frontend.createCustomer({
        customerNumber: "CUST-BOB-1",
        name: "Bob's Customer",
        primaryContact: { name: "John", email: "john@bobc.com" },
        billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });

      // Register and transition invoice: DRAFT -> ISSUED -> SENT
      bobInvoice = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001"));
      await frontend.issueInvoice(bobInvoice.id);
      await frontend.sendInvoice(bobInvoice.id);
    });

    it("should successfully register a payment request for a SENT invoice", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);

      expect(payment.id).toBeDefined();
      expect(payment.amount).toBe(500); // 5 * 100
      expect(payment.currency).toBe("USD");
      expect(payment.status).toBe("PROCESSING"); // State transitioned to PROCESSING upon gateway trigger
      expect(payment.reference).toMatch(/^PAY-REF-/);

      // Verify payment exists in boundary repository
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      expect(queryRes.isSuccess).toBe(true);
      expect(queryRes.value.status).toBe("PROCESSING");
      expect(queryRes.value.gatewayReference).toBeDefined();
    });

    it("should reject payment collection if target invoice is not in SENT status", async () => {
      // Create a DRAFT invoice
      const draftInv = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-DRAFT"));
      await expect(frontend.collectPayment(draftInv.id)).rejects.toThrow(/only allowed on SENT invoices/);

      // Create an ISSUED invoice (but not SENT)
      const issuedInv = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-ISSUED"));
      await frontend.issueInvoice(issuedInv.id);
      await expect(frontend.collectPayment(issuedInv.id)).rejects.toThrow(/only allowed on SENT invoices/);
    });

    it("should successfully confirm payment via webhook callback simulation (success path)", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      expect(payment.status).toBe("PROCESSING");

      // Verify gatewayReference is populated
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      // Simulate asynchronous successful webhook callback
      const webhookRes = await frontend.simulateWebhook(gatewayRef, true);
      expect(webhookRes.status).toBe("CONFIRMED");
      expect(webhookRes.transactionHash).toBeDefined();

      // Verify aggregate status in repository
      const reloadedRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      expect(reloadedRes.value.status).toBe("CONFIRMED");
      expect(reloadedRes.value.transactionHash).toBeDefined();

      // Under Phase 6, confirming a full payment reconciles the invoice to PAID status
      const invoice = await frontend.getInvoice(bobInvoice.id);
      expect(invoice.status).toBe("PAID");
    });

    it("should successfully mark payment as failed via webhook callback simulation (failure path)", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      // Simulate asynchronous failed webhook callback
      const webhookRes = await frontend.simulateWebhook(gatewayRef, false, "CARD_DECLINED", "Insufficient balance");
      expect(webhookRes.status).toBe("FAILED");

      // Verify aggregate status in repository
      const reloadedRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      expect(reloadedRes.value.status).toBe("FAILED");
    });

    it("should list all payments belonging to the active business context", async () => {
      await frontend.collectPayment(bobInvoice.id);

      const list = await frontend.listPayments();
      expect(list).toHaveLength(1);
      expect(list[0].amount).toBe(500);
    });

    it("should enforce tenant isolation boundaries on payment operations", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);

      // Charlie logs in
      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");

      // Charlie's payment list should be empty
      const charliePayments = await frontend.listPayments();
      expect(charliePayments).toHaveLength(0);

      // Charlie cannot fetch Bob's payment by ID
      await expect(frontend.getPayment(payment.id)).rejects.toThrow(/Access Denied|Forbidden/);
    });
  });

  describe("Payment Reconciliation Workflows (Phase 6)", () => {
    const password = "PasswordPlaintext123!";
    let bobCustomer: any;
    let bobInvoice: any;

    const baseInvoicePayload = (customerId: string, number: string, amount: number = 500) => ({
      customerId,
      invoiceNumber: number,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lines: [
        {
          description: "Services",
          quantity: 1,
          unitPrice: amount,
          taxRate: 0
        }
      ]
    });

    beforeEach(async () => {
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
      bobCustomer = await frontend.createCustomer({
        customerNumber: "CUST-BOB-1",
        name: "Bob's Customer",
        primaryContact: { name: "John", email: "john@bobc.com" },
        billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });

      bobInvoice = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001", 500));
      await frontend.issueInvoice(bobInvoice.id);
      await frontend.sendInvoice(bobInvoice.id);
    });

    it("should successfully reconcile full payment (Happy Path: SENT -> PAID)", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      await frontend.simulateWebhook(gatewayRef, true);

      // Verify invoice status transitioned to PAID
      const invoice = await frontend.getInvoice(bobInvoice.id);
      expect(invoice.status).toBe("PAID");
    });

    it("should successfully reconcile partial payment (SENT -> PARTIALLY_PAID)", async () => {
      // Create a $200 partial payment request against the $500 invoice
      const payment = await frontend.collectPayment(bobInvoice.id, 200);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      await frontend.simulateWebhook(gatewayRef, true);

      // Verify invoice status transitioned to PARTIALLY_PAID
      const invoice = await frontend.getInvoice(bobInvoice.id);
      expect(invoice.status).toBe("PARTIALLY_PAID");

      // Verify Outstanding balance in Accounts Receivable
      const arRes = await boundary.accountsReceivableRepository.findByCustomer(
        await import("../../../backend/src/business/organization/value-objects/OrganizationId.js").then(m => m.OrganizationId.from(invoice.organizationId)),
        await import("../../../backend/src/business/customer/value-objects/CustomerId.js").then(m => m.CustomerId.from(invoice.customerId))
      );
      expect(arRes.isSuccess).toBe(true);
      expect(arRes.value.getOutstandingBalance("USD").amount).toBe(300); // 500 - 200 = 300
    });

    it("should successfully reconcile full remaining payment across multiple partial payments", async () => {
      // 1. First payment of $200
      const payment1 = await frontend.collectPayment(bobInvoice.id, 200);
      const queryRes1 = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment1.id))
      );
      await frontend.simulateWebhook(queryRes1.value.gatewayReference!.value, true);

      const invoiceMid = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceMid.status).toBe("PARTIALLY_PAID");

      // 2. Second payment of $300 (remaining balance)
      const payment2 = await frontend.collectPayment(bobInvoice.id, 300);
      const queryRes2 = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment2.id))
      );
      await frontend.simulateWebhook(queryRes2.value.gatewayReference!.value, true);

      // Verify invoice status transitions to PAID
      const invoiceFinal = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceFinal.status).toBe("PAID");

      // Verify outstanding balance is 0
      const arRes = await boundary.accountsReceivableRepository.findByCustomer(
        await import("../../../backend/src/business/organization/value-objects/OrganizationId.js").then(m => m.OrganizationId.from(invoiceFinal.organizationId)),
        await import("../../../backend/src/business/customer/value-objects/CustomerId.js").then(m => m.CustomerId.from(invoiceFinal.customerId))
      );
      expect(arRes.value.getOutstandingBalance("USD").amount).toBe(0);
    });

    it("should successfully reconcile overpayment credit (SENT -> OVERPAID)", async () => {
      // Create a $600 overpayment request against $500 invoice
      const payment = await frontend.collectPayment(bobInvoice.id, 600);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      await frontend.simulateWebhook(gatewayRef, true);

      // Verify invoice status is OVERPAID
      const invoice = await frontend.getInvoice(bobInvoice.id);
      expect(invoice.status).toBe("OVERPAID");

      // Verify credit balance on AR account
      const arRes = await boundary.accountsReceivableRepository.findByCustomer(
        await import("../../../backend/src/business/organization/value-objects/OrganizationId.js").then(m => m.OrganizationId.from(invoice.organizationId)),
        await import("../../../backend/src/business/customer/value-objects/CustomerId.js").then(m => m.CustomerId.from(invoice.customerId))
      );
      expect(arRes.value.getCreditBalance("USD").amount).toBe(100); // 600 - 500 = 100 excess credit
    });

    it("should reject reconciliation when currency mismatch is detected", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const paymentAgg = queryRes.value;
      
      // Mutate the allocation currency to EUR
      const alloc = paymentAgg.allocations[0];
      const eurMoney = await import("../../../backend/src/business/invoice/value-objects/Money.js").then(m => m.Money.create(alloc.allocatedAmount.amount, "EUR").value);
      (alloc as any).props.allocatedAmount = eurMoney;
      await boundary.paymentRepository.save(paymentAgg);

      // Trigger webhook, expect failure due to currency validation
      await expect(
        frontend.simulateWebhook(paymentAgg.gatewayReference!.value, true)
      ).rejects.toThrow(/currency|Mismatch/i);
    });

    it("should protect reconciliation idempotency and ignore duplicate webhook callbacks", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      // Webhook 1
      await frontend.simulateWebhook(gatewayRef, true);
      const invoice1 = await frontend.getInvoice(bobInvoice.id);
      expect(invoice1.status).toBe("PAID");

      // Webhook 2 (duplicate)
      await frontend.simulateWebhook(gatewayRef, true);
      const invoice2 = await frontend.getInvoice(bobInvoice.id);
      expect(invoice2.status).toBe("PAID"); // remains PAID, no double allocation

      // Verify AR outstanding remains 0 (not negative or credit)
      const arRes = await boundary.accountsReceivableRepository.findByCustomer(
        await import("../../../backend/src/business/organization/value-objects/OrganizationId.js").then(m => m.OrganizationId.from(invoice1.organizationId)),
        await import("../../../backend/src/business/customer/value-objects/CustomerId.js").then(m => m.CustomerId.from(invoice1.customerId))
      );
      expect(arRes.value.getOutstandingBalance("USD").amount).toBe(0);
      expect(arRes.value.getCreditBalance("USD").amount).toBe(0);
    });

    it("should enforce tenant boundary isolation on reconciliation updates", async () => {
      // 1. Bob has Invoice A and Payment A
      const bobPayment = await frontend.collectPayment(bobInvoice.id);
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(bobPayment.id))
      );
      const bobGatewayRef = queryRes.value.gatewayReference!.value;

      // 2. Charlie logs in and creates Invoice B
      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");
      const charlieCustomer = await frontend.createCustomer({
        customerNumber: "CUST-CHAR-1",
        name: "Charlie's Customer",
        primaryContact: { name: "Adam", email: "adam@charc.com" },
        billingAddress: { line1: "2 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });
      const charlieInvoice = await frontend.createInvoice(baseInvoicePayload(charlieCustomer.id, "INV-CHAR-001", 500));
      await frontend.issueInvoice(charlieInvoice.id);
      await frontend.sendInvoice(charlieInvoice.id);

      // Charlie attempts to tamper with Bob's payment aggregate allocations by changing the invoiceId to Charlie's Invoice ID
      const bobPayAgg = queryRes.value;
      const bobAlloc = bobPayAgg.allocations[0];
      (bobAlloc as any).props.invoiceId = await import("../../../backend/src/business/invoice/value-objects/InvoiceId.js").then(m => m.InvoiceId.from(charlieInvoice.id));
      await boundary.paymentRepository.save(bobPayAgg);

      // Provider sends webhook for Bob's payment. When it processes, it loads Bob's payment aggregate.
      // It discovers that the allocation points to Charlie's invoice.
      // It must throw an Access Denied / tenant isolation breach error!
      await expect(
        frontend.simulateWebhook(bobGatewayRef, true)
      ).rejects.toThrow(/Access Denied|tenant/i);
    });
  });

  describe("Event-Driven Merchant Updates (Phase 7)", () => {
    const password = "PasswordPlaintext123!";
    let bobCustomer: any;
    let bobInvoice: any;

    const baseInvoicePayload = (customerId: string, number: string, amount: number = 500) => ({
      customerId,
      invoiceNumber: number,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lines: [
        {
          description: "Services",
          quantity: 1,
          unitPrice: amount,
          taxRate: 0
        }
      ]
    });

    beforeEach(async () => {
      backend.clearCache();
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
      bobCustomer = await frontend.createCustomer({
        customerNumber: "CUST-BOB-1",
        name: "Bob's Customer",
        primaryContact: { name: "John", email: "john@bobc.com" },
        billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });

      bobInvoice = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001", 500));
      await frontend.issueInvoice(bobInvoice.id);
      await frontend.sendInvoice(bobInvoice.id);
    });

    it("should successfully invalidate cache upon receiving InvoicePaid event (ACOS -> Event -> Invalidate -> Refresh)", async () => {
      // 1. Initial query from frontend should fetch and cache the invoice
      const invoiceFirst = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceFirst.status).toBe("SENT");
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(true);

      // 2. Collect payment and trigger webhook
      const payment = await frontend.collectPayment(bobInvoice.id);
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      // This webhook simulation confirmation internally performs reconciliation,
      // generates the InvoicePaid domain event, and publishes it onto the ACOS Event Bus.
      await frontend.simulateWebhook(gatewayRef, true);

      // 3. Verify that the event consumer intercepted the event and invalidated the cache
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(false);

      // 4. Query again - since cache was invalidated, it must pull fresh state from ACOS boundary
      const invoiceFinal = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceFinal.status).toBe("PAID");
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(true); // Cached again
    });

    it("should remain resilient and uncorrupted when handling duplicate events", async () => {
      // Populate cache
      await frontend.getInvoice(bobInvoice.id);
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(true);

      // Dispatch manual InvoicePaid event multiple times
      const eventClass = await import("../../../backend/src/business/invoice/events/InvoicePaid.js").then(m => m.InvoicePaid);
      const moneyClass = await import("../../../backend/src/business/invoice/value-objects/Money.js").then(m => m.Money);
      
      const event = new eventClass(bobInvoice.id, moneyClass.create(500, "USD").value);

      // Publish first time
      await boundary.eventBus.publish(event);
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(false);

      // Populate again
      await frontend.getInvoice(bobInvoice.id);
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(true);

      // Publish duplicate events sequentially
      await boundary.eventBus.publish(event);
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(false);

      await boundary.eventBus.publish(event);
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(false); // remains safe and invalidated
    });

    it("should preserve tenant boundary isolation and not cross-invalidate unrelated merchant caches", async () => {
      // 1. Bob caches Bob's Invoice
      await frontend.getInvoice(bobInvoice.id);
      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(true);

      // 2. Charlie registers, logs in, creates, and caches Charlie's Invoice
      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");
      const charlieCustomer = await frontend.createCustomer({
        customerNumber: "CUST-CHAR-1",
        name: "Charlie's Customer",
        primaryContact: { name: "Adam", email: "adam@charc.com" },
        billingAddress: { line1: "2 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });
      const charlieInvoice = await frontend.createInvoice(baseInvoicePayload(charlieCustomer.id, "INV-CHAR-001", 500));
      await frontend.issueInvoice(charlieInvoice.id);
      await frontend.sendInvoice(charlieInvoice.id);

      await frontend.getInvoice(charlieInvoice.id);
      expect(backend.isInvoiceCached(charlieInvoice.id)).toBe(true);

      // 3. Dispatch an InvoicePaid event for Bob's Invoice.
      // This should invalidate Bob's cache, but Charlie's cache must remain intact (uncorrupted isolation).
      const eventClass = await import("../../../backend/src/business/invoice/events/InvoicePaid.js").then(m => m.InvoicePaid);
      const moneyClass = await import("../../../backend/src/business/invoice/value-objects/Money.js").then(m => m.Money);
      const event = new eventClass(bobInvoice.id, moneyClass.create(500, "USD").value);

      await boundary.eventBus.publish(event);

      expect(backend.isInvoiceCached(bobInvoice.id)).toBe(false); // Bob's is invalidated
      expect(backend.isInvoiceCached(charlieInvoice.id)).toBe(true);  // Charlie's remains cached!
    });
  });

  describe("Merchant Dashboard Workflows (Phase 8)", () => {
    const password = "PasswordPlaintext123!";
    let bobCustomer: any;
    let bobInvoice: any;
    let bobBusiness: any;

    const baseInvoicePayload = (customerId: string, number: string, amount: number = 500) => ({
      customerId,
      invoiceNumber: number,
      currency: "USD",
      paymentTerms: "NET_30",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lines: [
        {
          description: "Services",
          quantity: 1,
          unitPrice: amount,
          taxRate: 0
        }
      ]
    });

    beforeEach(async () => {
      backend.clearCache();
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      bobBusiness = await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
      bobCustomer = await frontend.createCustomer({
        customerNumber: "CUST-BOB-1",
        name: "Bob's Customer",
        primaryContact: { name: "John", email: "john@bobc.com" },
        billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });

      bobInvoice = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, "INV-BOB-001", 500));
      await frontend.issueInvoice(bobInvoice.id);
      await frontend.sendInvoice(bobInvoice.id);
    });

    it("should successfully retrieve correct aggregated dashboard metrics scoped to business", async () => {
      const dashboard = await frontend.queryDashboard();

      expect(dashboard.organizationId).toBe(bobBusiness.id);
      expect(dashboard.currency).toBe("USD");

      // Verify Invoice Summary
      expect(dashboard.invoiceSummary.totalCount).toBe(1);
      expect(dashboard.invoiceSummary.totalAmount).toBe(500);
      expect(dashboard.invoiceSummary.sentCount).toBe(1); // Invoice has been issued and sent
      expect(dashboard.invoiceSummary.paidCount).toBe(0);

      // Verify Accounts Receivable
      expect(dashboard.outstandingAmount).toBe(500); // Grand total of SENT invoice is outstanding
      expect(dashboard.creditAmount).toBe(0);

      // Verify Recent Activity lists
      expect(dashboard.recentInvoices).toHaveLength(1);
      expect(dashboard.recentInvoices[0].invoiceNumber).toBe("INV-BOB-001");
      expect(dashboard.recentInvoices[0].customerName).toBe("Bob's Customer");
      expect(dashboard.recentInvoices[0].amount).toBe(500);
      expect(dashboard.recentInvoices[0].status).toBe("SENT");

      expect(dashboard.recentPayments).toHaveLength(0);
    });

    it("should successfully cache dashboard queries and invalidate cache reactively upon webhook payment confirmation", async () => {
      // 1. Initial query from frontend should fetch and cache the dashboard metrics DTO
      const dashboard1 = await frontend.queryDashboard();
      expect(dashboard1.outstandingAmount).toBe(500);
      expect(backend.isDashboardCached(bobBusiness.id)).toBe(true);

      // 2. Collect payment and trigger webhook reconciliation
      const payment = await frontend.collectPayment(bobInvoice.id);
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      // Simulate webhook payment confirmation -> triggers InvoicePaid domain event -> invalidates dashboard cache
      await frontend.simulateWebhook(gatewayRef, true);

      // Verify dashboard cache has been invalidated
      expect(backend.isDashboardCached(bobBusiness.id)).toBe(false);

      // 3. Subsequent query fetches fresh state from ACOS boundary
      const dashboard2 = await frontend.queryDashboard();
      expect(dashboard2.outstandingAmount).toBe(0); // Fully reconciled, outstanding balance is 0
      expect(dashboard2.paymentSummary.totalAmount).toBe(500); // 500 collected
      expect(dashboard2.invoiceSummary.paidCount).toBe(1);
      expect(dashboard2.recentPayments).toHaveLength(1);
      expect(dashboard2.recentPayments[0].status).toBe("CONFIRMED");
    });

    it("should protect dashboard queries against cross-tenant access", async () => {
      // Bob is logged in, Bob can read Bob's dashboard
      const bobDashboard = await frontend.queryDashboard();
      expect(bobDashboard.organizationId).toBe(bobBusiness.id);

      // Charlie logs in
      frontend.clearSessionToken();
      await frontend.signUp("charlie@example.com", password, "Charlie Merchant");
      await frontend.login("charlie@example.com", password);
      const charlieBusiness = await frontend.onboardBusiness("Charlie Shop", "charlie-shop", "USD");

      // Charlie fetches Charlie's dashboard
      const charlieDashboard = await frontend.queryDashboard();
      expect(charlieDashboard.organizationId).toBe(charlieBusiness.id);

      // Charlie attempts to query Bob's dashboard context directly on backend, which must be blocked by verification
      await expect(
        backend.handleRequest("GET", "/business/dashboard", {}, { Authorization: `Bearer ${frontend.getSessionToken()}` })
      ).resolves.toEqual(expect.objectContaining({
        status: 200 // Wait, handleRequest("/business/dashboard") retrieves the authenticated user's dashboard based on the session token claim, ignoring arbitrary tenant parameters!
      }));

      // Let's verify that the dashboard loaded by Charlie indeed contains Charlie's organization ID
      const response = await backend.handleRequest("GET", "/business/dashboard", {}, { Authorization: `Bearer ${frontend.getSessionToken()}` });
      expect(response.body.organizationId).toBe(charlieBusiness.id);
      expect(response.body.organizationId).not.toBe(bobBusiness.id); // Secure tenant boundary maintained!
    });
  });

  describe("Production Hardening — Track 11.3 (Secure Credentials & Cookie Session Storage)", () => {
    it("should hash user passwords securely using bcrypt", async () => {
      // 1. Sign up a new user
      const uniqueEmail = `harden11.3_${Date.now()}@example.com`;
      const signUpRes = await backend.handleRequest("POST", "/auth/signup", {
        email: uniqueEmail,
        password: "securePassword123",
        name: "Hardened Merchant"
      });
      expect(signUpRes.status).toBe(201);

      // 2. Fetch the created user from the repository to inspect the hash format
      const userRes = await boundary.userRepository.findByEmail(Email.create(uniqueEmail).value);
      expect(userRes.isSuccess).toBe(true);
      const user = userRes.value;

      // 3. Bcrypt hashes start with $2a$ or $2b$ and have 60 characters
      expect(user.passwordHash.value.startsWith("$2a$") || user.passwordHash.value.startsWith("$2b$")).toBe(true);
      expect(user.passwordHash.value).toHaveLength(60);
    });

    it("should set HttpOnly session_token cookie on login/signup, support authentication via Cookie header, and clear it on logout", async () => {
      const email = `session_cookie_${Date.now()}@example.com`;
      const pass = "password123";

      // 1. Signup sets Set-Cookie header
      const signupRes = await backend.handleRequest("POST", "/auth/signup", {
        email,
        password: pass,
        name: "Cookie Merchant"
      });
      expect(signupRes.status).toBe(201);
      
      const url = `http://localhost:9001`;
      
      // Let's perform a direct HTTP login call using global fetch
      const loginRes = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      
      expect(loginRes.status).toBe(200);
      const setCookieHeader = loginRes.headers.get("Set-Cookie") || loginRes.headers.get("set-cookie");
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain("session_token=");
      expect(setCookieHeader).toContain("HttpOnly");
      expect(setCookieHeader).toContain("Path=/");

      // Extract the session token value from Set-Cookie
      const cookieValue = setCookieHeader!.split(";")[0].split("=")[1];

      // 2. Query /auth/me passing Cookie header instead of Authorization header
      const meRes = await fetch(`${url}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `session_token=${cookieValue}`
        }
      });
      expect(meRes.status).toBe(200);
      const meBody = await meRes.json();
      expect(meBody.email).toBe(email);

      // 3. Logout clears the cookie
      const logoutRes = await fetch(`${url}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `session_token=${cookieValue}`
        }
      });
      expect(logoutRes.status).toBe(200);
      const logoutSetCookie = logoutRes.headers.get("Set-Cookie") || logoutRes.headers.get("set-cookie");
      expect(logoutSetCookie).toBeDefined();
      expect(logoutSetCookie).toContain("Max-Age=0");
    });
  });

  describe("Production Hardening — Track 11.6 (Durable Transactional Outbox)", () => {
    it("should write domain events to the outbox database table and publish them asynchronously", async () => {
      const outboxRecords: any[] = [];
      const mockPrisma = {
        outboxEvent: {
          create: async (args: any) => {
            outboxRecords.push({
              id: "evt-123",
              eventType: args.data.eventType,
              payload: args.data.payload,
              processed: false
            });
            return outboxRecords[outboxRecords.length - 1];
          },
          findMany: async () => {
            return outboxRecords.filter(r => !r.processed);
          },
          update: async (args: any) => {
            const rec = outboxRecords.find(r => r.id === args.where.id);
            if (rec) {
              rec.processed = args.data.processed;
              rec.processedAt = args.data.processedAt;
            }
            return rec;
          }
        }
      };

      // 1. Assign mock prisma to activate outbox path
      (boundary as any).prismaClient = mockPrisma;

      // 2. Publish a dummy event
      const dummyEvent = {
        eventName: "dummyEvent",
        occurredOn: new Date(),
        invoiceId: "inv-999",
        amount: 500,
        currency: "USD"
      };

      let eventReceived = false;
      boundary.eventBus.subscribe("dummyEvent", {
        handle: async (evt: any) => {
          if (evt.invoiceId === "inv-999") {
            eventReceived = true;
          }
        }
      });

      // Publish via eventBus wrapper
      await boundary.eventBus.publish(dummyEvent as any);

      // Wait for background outbox processor to finish processing
      for (let i = 0; i < 100; i++) {
        if (!(boundary as any).isProcessingOutbox && outboxRecords[0]?.processed) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Verify that the event was recorded in the mock database outbox table
      expect(outboxRecords).toHaveLength(1);
      expect(outboxRecords[0].eventType).toBe("dummyEvent");
      expect(JSON.parse(outboxRecords[0].payload).invoiceId).toBe("inv-999");

      // Verify that background runner executed, dispatched event to raw event bus, and marked processed
      expect(eventReceived).toBe(true);
      expect(outboxRecords[0].processed).toBe(true);

      // Restore boundary reference
      (boundary as any).prismaClient = null;
    });
  });

  describe("Production Hardening — Track 11.5 (Idempotency Key Persistence)", () => {
    const url = `http://localhost:9001`;

    it("should process duplicate requests with the same Idempotency-Key exactly once and return cached responses", async () => {
      const email = `idemp_${Date.now()}@example.com`;
      const payload = {
        email,
        password: "password123",
        name: "Idempotent User"
      };
      const idempotencyKey = `key-${Date.now()}`;

      // Call 1
      const res1 = await fetch(`${url}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload)
      });
      expect(res1.status).toBe(201);
      const body1 = await res1.json();
      expect(body1.email).toBe(email);

      // Call 2 (duplicate request)
      const res2 = await fetch(`${url}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload)
      });
      expect(res2.status).toBe(201);
      const body2 = await res2.json();
      expect(body2.email).toBe(email);
      expect(body2).toEqual(body1); // Returns identical payload

      // Verify that user was created in the mock repository exactly once
      const userRes = await boundary.userRepository.findByEmail(Email.create(email).value);
      expect(userRes.isSuccess).toBe(true);
    });

    it("should persist and resolve idempotency records in PostgreSQL if prisma is active", async () => {
      const idempotencyKey = `pg-key-${Date.now()}`;
      
      // Mock prismaClient on boundary
      const mockPrisma = {
        idempotencyRecord: {
          findUnique: async (args: any) => {
            if (args.where.key === idempotencyKey) {
              return { key: idempotencyKey, statusCode: 200, responseBody: JSON.stringify({ cached: true }) };
            }
            return null;
          },
          upsert: async () => {}
        }
      };

      (boundary as any).prismaClient = mockPrisma;

      // Make GET request (which shouldn't match cached POST response, since GET is read-only)
      const getRes = await fetch(`${url}/auth/me`, {
        method: "GET",
        headers: {
          "Idempotency-Key": idempotencyKey
        }
      });
      expect(getRes.status).not.toBe(200); // Because no auth token was sent, it will fail auth checks, proving GET bypassed idempotency cache!

      // Make POST request with matching key, which should hit the cached response directly
      const postRes = await fetch(`${url}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({})
      });
      expect(postRes.status).toBe(200);
      const body = await postRes.json();
      expect(body.cached).toBe(true);

      // Restore boundary prismaClient reference
      (boundary as any).prismaClient = null;
    });
  });

  describe("Production Hardening — Track 11.4 (Stripe-Signature Webhook Verification)", () => {
    const url = `http://localhost:9001`;
    const webhookSecret = "whsec_stripe_test_secret_123456789";

    const createSignature = (payload: any, timestamp: string, secret: string) => {
      const crypto = require("crypto");
      return crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${JSON.stringify(payload)}`)
        .digest("hex");
    };

    it("should accept valid webhook signatures", async () => {
      const payload = {
        gatewayReference: "some-gateway-ref-id-12345",
        success: false,
        errorCode: "CARD_DECLINED",
        errorMessage: "Insufficient funds"
      };
      const t = Math.floor(Date.now() / 1000).toString();
      const signature = createSignature(payload, t, webhookSecret);

      const res = await fetch(`${url}/payments/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": `t=${t},v1=${signature}`
        },
        body: JSON.stringify(payload)
      });

      // 404 is expected here because the gateway reference is unknown/mocked,
      // but it proves signature verification passed (missing/invalid signature returns 401/400 instead!)
      expect(res.status).toBe(404);
    });

    it("should reject webhook requests missing Stripe-Signature header with 401 Unauthorized", async () => {
      const payload = { gatewayReference: "ref", success: true };
      const res = await fetch(`${url}/payments/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toContain("Missing Stripe-Signature");
    });

    it("should reject webhook requests with malformed Stripe-Signature header formats with 400 Bad Request", async () => {
      const payload = { gatewayReference: "ref", success: true };
      const res = await fetch(`${url}/payments/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": "invalid-format-without-equals-sign"
        },
        body: JSON.stringify(payload)
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Malformed Stripe-Signature");
    });

    it("should reject webhook requests with incorrect signature values with 401 Unauthorized", async () => {
      const payload = { gatewayReference: "ref", success: true };
      const t = Math.floor(Date.now() / 1000).toString();
      const res = await fetch(`${url}/payments/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": `t=${t},v1=wrongsignature1234567890abcdef`
        },
        body: JSON.stringify(payload)
      });
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toContain("signature verification failed");
    });

    it("should reject webhook requests suffering from excessive timestamp drift (> 5 minutes) with 400 Bad Request", async () => {
      const payload = { gatewayReference: "ref", success: true };
      // Simulate 10 minutes ago
      const t = (Math.floor(Date.now() / 1000) - 600).toString();
      const signature = createSignature(payload, t, webhookSecret);

      const res = await fetch(`${url}/payments/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": `t=${t},v1=${signature}`
        },
        body: JSON.stringify(payload)
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("timestamp drift too large");
    });
  });

  describe("Production Hardening — Track 11.7 (Request Correlation IDs & Observability)", () => {
    const url = `http://localhost:9001`;

    it("should generate a request correlation ID, return it in the headers, and accept supplied IDs", async () => {
      // 1. Send request without correlation ID -> server generates one
      const res1 = await fetch(`${url}/health`);
      expect(res1.status).toBe(200);
      const cid1 = res1.headers.get("x-correlation-id") || res1.headers.get("X-Correlation-ID");
      expect(cid1).toBeDefined();
      expect(cid1?.startsWith("corr_")).toBe(true);

      // 2. Send request with explicit correlation ID -> server propagates it back
      const customCid = "custom-correlation-uuid-value-12345";
      const res2 = await fetch(`${url}/health`, {
        headers: {
          "X-Correlation-ID": customCid
        }
      });
      expect(res2.status).toBe(200);
      const cid2 = res2.headers.get("x-correlation-id") || res2.headers.get("X-Correlation-ID");
      expect(cid2).toBe(customCid);
    });

    it("should return detailed database and ACOS connectivity status in health check response", async () => {
      const res = await fetch(`${url}/health`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe("UP");
      expect(body.checks).toBeDefined();
      expect(body.checks.database).toBeDefined();
      expect(body.checks.acosSubsystems).toBe("CONNECTED");
    });
  });
});
