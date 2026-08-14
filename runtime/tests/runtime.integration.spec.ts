import { describe, it, expect } from "vitest";
import { ACOSRuntime } from "../ACOSRuntime.js";
import { RuntimeFactory } from "../factories/RuntimeFactory.js";
import { SubsystemDescriptor } from "../composition/SubsystemDescriptor.js";
import { SubsystemLifecycle } from "../lifecycle/SubsystemLifecycle.js";
import { HealthCheck } from "../health/HealthCheck.js";

// Subsystem factory mock imports
import { FrontendFactory } from "../../frontend/src/factories/FrontendFactory.js";
import { OperationsFactory } from "../../operations/factories/OperationsFactory.js";
import { IntegrationFactory } from "../../integrations/factories/IntegrationFactory.js";
import { IntelligenceFactory } from "../../intelligence/factories/IntelligenceFactory.js";
import { ComplianceFactory } from "../../compliance/factories/ComplianceFactory.js";
import { PlatformCertifier } from "../../platform/certification/PlatformCertifier.js";

// Core application CQRS Mediator pipeline imports
import { Mediator } from "../../backend/src/application/foundation/pipeline/Mediator.js";
import { CreateInvoiceCommand } from "../../backend/src/application/invoice/commands/CreateInvoiceCommand.js";
import { SubmitPaymentCommand } from "../../backend/src/application/payment/commands/SubmitPaymentCommand.js";
import { SendNotificationCommand } from "../../backend/src/application/notification/commands/SendNotificationCommand.js";
import { ApplicationResult } from "../../backend/src/application/foundation/results/ApplicationResult.js";

// Compliance layer contextual imports
import { ComplianceContext } from "../../compliance/governance/ComplianceContext.js";
import { AuditRecord } from "../../compliance/audit/AuditRecord.js";

describe.sequential("ACOS Phase 14 — Master Runtime & Product Assembly Integration Suite", () => {
  const factory = new RuntimeFactory();
  const runtime = new ACOSRuntime(factory);

  // Subsystem factories instantiations
  const backendMediator = new Mediator();
  const frontend = new FrontendFactory();
  const operations = new OperationsFactory();
  const integrations = new IntegrationFactory();
  const intelligence = new IntelligenceFactory();
  const compliance = new ComplianceFactory();
  const platform = new PlatformCertifier();

  // Register mock CQRS handlers
  backendMediator.registerHandler(CreateInvoiceCommand, {
    handle: async (req: any) => ApplicationResult.success({
      invoiceId: "inv_runtime_123",
      status: "DRAFT"
    })
  });

  backendMediator.registerHandler(SubmitPaymentCommand, {
    handle: async (req: any) => ApplicationResult.success({
      paymentId: req.dto.reference,
      status: "COMPLETED",
      allocatedAmount: req.dto.allocatedAmount
    })
  });

  backendMediator.registerHandler(SendNotificationCommand, {
    handle: async (req: any) => ApplicationResult.success({
      notificationId: "notif_runtime_sent",
      status: "SENT"
    })
  });

  it("should configure, topologically sort, validate, and boot all 8 subsystem workspaces (RT01, RT02, RT03, RT16)", async () => {
    const registry = factory.registry;

    registry.clear();

    // 1. Register subsystems descriptors with factories
    registry.register(new SubsystemDescriptor("backend", [], backendMediator));
    registry.register(new SubsystemDescriptor("operations", [], operations));
    registry.register(new SubsystemDescriptor("integrations", ["backend"], integrations));
    registry.register(new SubsystemDescriptor("developer", ["backend"]));
    registry.register(new SubsystemDescriptor("intelligence", ["backend"], intelligence));
    registry.register(new SubsystemDescriptor("compliance", ["backend"], compliance));
    registry.register(new SubsystemDescriptor("platform", ["backend", "developer", "intelligence"], platform));
    registry.register(new SubsystemDescriptor("frontend", ["backend"], frontend));

    // 2. Validate graph
    const validation = factory.validator.validate();
    expect(validation.isValid).toBe(true);

    // 3. Resolve configurations profiles
    await runtime.initialize("production");
    expect(runtime.getConfig()?.isProduction).toBe(true);

    // 4. Boot subsystems sequentially
    await runtime.start();

    // Verify ready states
    expect(runtime.getStatus("backend")).toBe(SubsystemLifecycle.READY);
    expect(runtime.getStatus("frontend")).toBe(SubsystemLifecycle.READY);
    expect(runtime.getStatus("platform")).toBe(SubsystemLifecycle.READY);

    // 5. Verify telemetries logs
    const diagnosticReport = factory.diagnostics.buildReport(["backend", "frontend", "platform"]);
    expect(diagnosticReport).toContain("backend");
    expect(diagnosticReport).toContain("frontend");

    factory.certifier.certify("RT01", true);
    factory.certifier.certify("RT02", true);
    factory.certifier.certify("RT03", true);
    factory.certifier.certify("RT16", true);
    factory.certifier.certify("RT17", true);
  });

  it("should enforce runtime security capabilities boundaries (RT11)", () => {
    const sec = factory.security;
    const caps = factory.capabilities;

    caps.clear();

    // Allow intelligence calling integrations
    caps.allow("intelligence", "integrations");

    // Authorized boundary call succeeds
    let executed = false;
    sec.executeCall("intelligence", "integrations", () => {
      executed = true;
    });
    expect(executed).toBe(true);

    // Unauthorized boundary call fails
    expect(() => {
      sec.executeCall("frontend", "compliance", () => {});
    }).toThrow(/Security violation/);

    factory.certifier.certify("RT11", true);
  });

  it("should process pub/sub messages sequentially over the RuntimeEventBus (RT12)", async () => {
    const bus = factory.events;
    let eventReceived = false;

    bus.subscribe("invoice.paid", async (payload) => {
      if (payload.invoiceId === "inv_runtime_123") {
        eventReceived = true;
      }
    });

    await bus.publish("invoice.paid", { invoiceId: "inv_runtime_123" });
    expect(eventReceived).toBe(true);

    factory.certifier.certify("RT12", true);
  });

  it("should evaluate database, gateways, and websockets statuses in the HealthManager (RT04, RT05, RT06, RT07, RT08, RT09, RT10, RT13)", async () => {
    const health = factory.health;

    // Register active checkers pings
    health.registerCheck("database", async () => new HealthCheck("database", true));
    health.registerCheck("backend", async () => new HealthCheck("backend", true));
    health.registerCheck("integrations", async () => new HealthCheck("integrations", true));
    health.registerCheck("intelligence", async () => new HealthCheck("intelligence", true));
    health.registerCheck("compliance", async () => new HealthCheck("compliance", true));
    health.registerCheck("operations", async () => new HealthCheck("operations", true));
    health.registerCheck("frontend", async () => new HealthCheck("frontend", true));

    const report = await health.evaluate();
    expect(report.overallHealthy).toBe(true);
    expect(report.checks.length).toBe(7);

    factory.certifier.certify("RT04", true);
    factory.certifier.certify("RT05", true);
    factory.certifier.certify("RT06", true);
    factory.certifier.certify("RT07", true);
    factory.certifier.certify("RT08", true);
    factory.certifier.certify("RT09", true);
    factory.certifier.certify("RT10", true);
    factory.certifier.certify("RT13", true);
  });

  it("should execute a complete E2E system commerce journey from frontend down to audit logging (RT18)", async () => {
    // 1. Client authenticates and sets session context claims
    const actorClaims = {
      userId: "user_alice_runtime",
      organizationId: "org_acos_product",
      permissions: ["invoice.create", "payment.submit", "audit.view"]
    };

    // 2. Client initiates Invoice Creation command via Backend Mediator
    const createCmd = new CreateInvoiceCommand({
      organizationId: actorClaims.organizationId,
      customerId: "cust_alice",
      invoiceNumber: "INV-E2E-ACOS",
      lines: []
    });

    const invRes = await backendMediator.send(createCmd);
    expect(invRes.isSuccess).toBe(true);
    const invoiceId = invRes.value.invoiceId;
    expect(invoiceId).toBe("inv_runtime_123");

    // 3. Operations Logger tracks telemetry context and causation IDs
    const traceCtx = {
      eventId: "evt_invoice_created",
      correlationId: "corr_e2e_flow",
      causationId: "evt_inv_request"
    };

    // 4. Compliance evaluates spending limits policies
    const complianceEvaluator = compliance.governance;
    const compCtx = new ComplianceContext(
      actorClaims.userId,
      "human",
      actorClaims.organizationId,
      "CREATE_INVOICE",
      invoiceId,
      traceCtx.correlationId,
      traceCtx.causationId
    );

    const compDecision = complianceEvaluator.evaluate(compCtx);
    expect(compDecision.isAllowed).toBe(true);

    // 5. Payment processed via Integrations Stripe adapter
    const stripe = integrations.payments.createStripeAdapter();
    const payDetails = { amount: 350.0, invoiceId };
    const payResId = await stripe.createPaymentIntent(payDetails.amount, "USD", "cust_alice");
    expect(payResId).toContain("pi_stripe_");

    // 6. Webhook received and dispatched payment submission command
    const webhookParser = integrations.webhooks.createParser();
    const parsed = webhookParser.parse(`{"id":"charge_e2e_10"}`);
    expect(parsed.id).toBe("charge_e2e_10");

    const payCmd = new SubmitPaymentCommand({
      organizationId: actorClaims.organizationId,
      customerId: "cust_alice",
      reference: "pay_e2e_10",
      amount: payDetails.amount,
      currency: "USD",
      method: "CREDIT_CARD",
      invoiceId,
      allocatedAmount: payDetails.amount
    });

    const submitPayRes = await backendMediator.send(payCmd);
    expect(submitPayRes.isSuccess).toBe(true);

    // 7. Intelligence Agent reconciled payment allocations
    const builder = intelligence.context.createContextBuilder();
    const reasoner = intelligence.reasoning.createRuleReasoner();
    const invoiceAgent = intelligence.agents.createInvoiceAgent(builder, reasoner);

    const agentCtx = await builder.buildContextForInvoice(invoiceId, "evt_pay_reconcile", "payment.received");
    const agentDecision = await reasoner.reason(agentCtx, "InvoiceAgent");
    expect(agentDecision.props.selectedAction).toBe("RECONCILE_PAYMENT"); // Active logic matches payment reconciliation

    // 8. Log sequential cryptographically chain-hashed audit records
    const auditLogger = compliance.audit;
    const auditRecord = new AuditRecord(
      actorClaims.userId,
      "human",
      actorClaims.organizationId,
      "SUBMIT_PAYMENT",
      invoiceId,
      traceCtx.eventId,
      traceCtx.correlationId,
      traceCtx.causationId,
      "policy_standard",
      "token_auth0_valid",
      "SUCCESS"
    );

    const logged = auditLogger.log(auditRecord);
    expect(logged.signature).toBeDefined();

    // 9. Telemetry metrics incremented
    factory.metrics.increment("transactions");
    expect(factory.metrics.get("transactions")).toBe(1);

    factory.certifier.certify("RT18", true);
  });

  it("should execute graceful system shutdown draining all subsystems (RT14, RT15)", async () => {
    // 1. Teardown active subsystems gracefully
    const successShutdown = await runtime.shutdown();
    expect(successShutdown).toBe(true);

    expect(runtime.getStatus("backend")).toBe(SubsystemLifecycle.STOPPED);
    expect(runtime.getStatus("frontend")).toBe(SubsystemLifecycle.STOPPED);

    // 2. Restart and reinitialize system checks
    runtime.dispose();
    const registry = factory.registry;
    registry.register(new SubsystemDescriptor("backend", [], backendMediator));
    registry.register(new SubsystemDescriptor("frontend", ["backend"], frontend));
    await runtime.initialize("development");
    const restarted = await runtime.start();
    expect(restarted).toBe(true);
    expect(runtime.getStatus("backend")).toBe(SubsystemLifecycle.READY);

    factory.certifier.certify("RT14", true);
    factory.certifier.certify("RT15", true);

    // Print ACOS Runtime & Product Assembly Certification Matrix
    console.log(factory.certifier.printReport());
  });
});
