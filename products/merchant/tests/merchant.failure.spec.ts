import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Logger, LogWriter } from "../../../backend/src/foundation/logging/Logger.js";
import { LogEntry } from "../../../backend/src/foundation/logging/LogEntry.js";
import { Mediator } from "../../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend, MerchantBackendState } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";

describe("ACOS Merchant — Failure & Edge-Case Validation (Phase 10)", () => {
  const logs: LogEntry[] = [];
  const writer: LogWriter = (entry) => {
    logs.push(entry);
  };

  let boundary: AcosIntegrationBoundary;
  let backend: MerchantBackend;
  let frontend: MerchantFrontend;
  let config: MerchantConfig;

  beforeAll(async () => {
    const runtimeFactory = new RuntimeFactory();
    const backendMediator = new Mediator();

    runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], backendMediator));
    runtimeFactory.health.registerCheck("backend", async () => ({
      name: "backend",
      healthy: true
    } as any));

    config = MerchantConfig.loadFromEnv({
      port: 9003, // Separate port
      env: "test",
      acosEndpoint: "http://localhost:3000",
      dbUrl: "postgresql://localhost:5432/merchant_test",
      enableAcosFeatures: true
    });

    const boundaryLogger = new Logger("AcosBoundary", writer);
    boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
    backend = new MerchantBackend(config, boundary, writer);
    frontend = new MerchantFrontend(backend, writer);

    await boundary.connect("test");
    await backend.start();
  });

  afterAll(async () => {
    await backend.stop();
    await boundary.disconnect();
  });

  beforeEach(() => {
    backend.clearCache();
  });

  describe("Infrastructure & State Offline Failures", () => {
    it("should reject requests with 503 Service Unavailable when the backend server is stopped", async () => {
      // 1. Stop backend
      await backend.stop();
      expect(backend.getState()).toBe(MerchantBackendState.STOPPED);

      // 2. Query endpoint
      const response = await backend.handleRequest("GET", "/health");
      expect(response.status).toBe(503);
      expect(response.body.error).toContain("Service Unavailable");

      // 3. Restart for remaining tests
      await backend.start();
      expect(backend.getState()).toBe(MerchantBackendState.RUNNING);
    });

    it("should return 502 Bad Gateway on /acos-status when the ACOS boundary connection is disconnected", async () => {
      // 1. Disconnect boundary
      await boundary.disconnect();

      // 2. Check status
      const response = await backend.handleRequest("GET", "/acos-status");
      expect(response.status).toBe(502);
      expect(response.body.status).toBe("DISCONNECTED");

      // 3. Re-connect boundary for remaining tests
      await boundary.connect("test");
    });
  });

  describe("Authentication & Client Request Failures", () => {
    it("should reject login attempts with invalid credentials", async () => {
      const email = "bob@example.com";
      const wrongPassword = "WrongPassword123!";

      const response = await backend.handleRequest("POST", "/auth/login", {
        email,
        password: wrongPassword
      });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should reject requests missing Authorization headers on authenticated routes", async () => {
      const response = await backend.handleRequest("GET", "/business/dashboard");
      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Unauthorized");
    });
  });

  describe("Webhook & Reconciliation Failures", () => {
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
          description: "Services",
          quantity: 1,
          unitPrice: 500,
          taxRate: 0
        }
      ]
    });

    beforeAll(async () => {
      await frontend.signUp("bob@example.com", password, "Bob Merchant");
      await frontend.login("bob@example.com", password);
      await frontend.onboardBusiness("Bob Shop", "bob-shop", "USD");
      bobCustomer = await frontend.createCustomer({
        customerNumber: "CUST-BOB-1",
        name: "Bob's Customer",
        primaryContact: { name: "John", email: "john@bobc.com" },
        billingAddress: { line1: "1 St", city: "Bos", state: "MA", postalCode: "02", country: "USA" }
      });
    });

    beforeEach(async () => {
      bobInvoice = await frontend.createInvoice(baseInvoicePayload(bobCustomer.id, `INV-FAIL-${Math.random()}`));
      await frontend.issueInvoice(bobInvoice.id);
      await frontend.sendInvoice(bobInvoice.id);
    });

    it("should return 404 Not Found when webhook carries an unknown gateway reference", async () => {
      const response = await backend.handleRequest("POST", "/payments/webhook", {
        gatewayReference: "unknown-ref-12345",
        success: true
      });
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Not Found");
    });

    it("should return 400 Bad Request when webhook carries malformed payload parameters", async () => {
      const response = await backend.handleRequest("POST", "/payments/webhook", {
        gatewayReference: ""
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Bad Request");
    });

    it("should handle duplicate webhook confirmation calls idempotently and prevent double reconciliation", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const gatewayRef = queryRes.value.gatewayReference!.value;

      // Webhook call 1
      const response1 = await backend.handleRequest("POST", "/payments/webhook", {
        gatewayReference: gatewayRef,
        success: true
      });
      expect(response1.status).toBe(200);
      expect(response1.body.status).toBe("CONFIRMED");

      // Verify invoice state
      const invoiceMid = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceMid.status).toBe("PAID");

      // Webhook call 2 (duplicate)
      const response2 = await backend.handleRequest("POST", "/payments/webhook", {
        gatewayReference: gatewayRef,
        success: true
      });
      expect(response2.status).toBe(200);
      expect(response2.body.status).toBe("CONFIRMED"); // Remains CONFIRMED

      // Verify invoice status did not corrupt (remains PAID, not doubled or broken)
      const invoiceFinal = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceFinal.status).toBe("PAID");
    });

    it("should isolate state during failure-in-the-middle, keeping invoice SENT if reconciliation fails due to currency mismatch", async () => {
      const payment = await frontend.collectPayment(bobInvoice.id);
      
      const queryRes = await boundary.paymentRepository.findById(
        await import("../../../backend/src/business/payment/value-objects/PaymentId.js").then(m => m.PaymentId.from(payment.id))
      );
      const paymentAgg = queryRes.value;

      // Force currency mismatch in allocations directly in the mock repo
      const alloc = paymentAgg.allocations[0];
      const eurMoney = await import("../../../backend/src/business/invoice/value-objects/Money.js").then(m => m.Money.create(alloc.allocatedAmount.amount, "EUR").value);
      (alloc as any).props.allocatedAmount = eurMoney;
      await boundary.paymentRepository.save(paymentAgg);

      // Trigger webhook - reconciliation must throw currency mismatch, rejecting confirmation
      const response = await backend.handleRequest("POST", "/payments/webhook", {
        gatewayReference: paymentAgg.gatewayReference!.value,
        success: true
      });

      // Assert bad request/validation failure status returned
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Webhook Processing Failed");
      expect(response.body.message).toContain("currency");

      // Assert that invoice state was isolated and remained SENT (not PAID or PARTIALLY_PAID)
      const invoiceFinal = await frontend.getInvoice(bobInvoice.id);
      expect(invoiceFinal.status).toBe("SENT");

    });
  });

  describe("Event Bus & Handler Resilience Failures", () => {
    it("should handle unknown event types dispatched to event bus gracefully without crashing", async () => {
      // Simulate dispatching a mock event that is not subscribed to by any merchant handler
      const baseEventClass = await import("../../../backend/src/foundation/events/DomainEvent.js").then(m => m.BaseDomainEvent);
      class UnknownDomainEvent extends baseEventClass {
        constructor() {
          super("aggregate-id", "UnknownAggregate");
        }
      }

      const event = new UnknownDomainEvent();
      
      // Dispatch event, must resolve without error or crash
      await expect(
        boundary.eventBus.publish(event)
      ).resolves.not.toThrow();
    });
  });
});
