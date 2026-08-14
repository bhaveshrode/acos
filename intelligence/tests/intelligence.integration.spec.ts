import { describe, it, expect } from "vitest";
import { IntelligenceFactory } from "../factories/IntelligenceFactory.js";
import { RuleBasedReasoner } from "../reasoning/RuleBasedReasoner.js";
import { ModelBasedReasoner } from "../reasoning/ModelBasedReasoner.js";
import { MockModelProvider } from "../reasoning/MockModelProvider.js";
import { PlanBuilder } from "../planning/PlanBuilder.js";
import { PlanValidator } from "../planning/PlanValidator.js";
import { PolicyEvaluator } from "../policies/PolicyEvaluator.js";
import { TelemetryEmitter } from "../observability/TelemetryEmitter.js";

// Backend application imports
import { Mediator } from "../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubmitPaymentCommand } from "../../backend/src/application/payment/commands/SubmitPaymentCommand.js";
import { SendNotificationCommand } from "../../backend/src/application/notification/commands/SendNotificationCommand.js";
import { CreateInvoiceCommand } from "../../backend/src/application/invoice/commands/CreateInvoiceCommand.js";
import { ApplicationResult } from "../../backend/src/application/foundation/results/ApplicationResult.js";

describe("ACOS Hardened Intelligence Layer Integration Tests (intelligence.integration.spec.ts)", () => {
  const factory = new IntelligenceFactory();
  const testMediator = new Mediator();

  // Register mock handlers for ACOS application commands
  testMediator.registerHandler(SubmitPaymentCommand, {
    handle: async (req: any) => ApplicationResult.success({
      paymentId: req.dto.reference,
      status: "COMPLETED",
      allocatedAmount: req.dto.allocatedAmount
    })
  });

  testMediator.registerHandler(SendNotificationCommand, {
    handle: async (req: any) => ApplicationResult.success({
      notificationId: `notif_${Date.now()}`,
      status: "SENT"
    })
  });

  testMediator.registerHandler(CreateInvoiceCommand, {
    handle: async (req: any) => ApplicationResult.success({
      invoiceId: `inv_${Math.floor(Math.random() * 100000)}`,
      status: "DRAFT"
    })
  });

  it("should verify sub-factories resolution via Composition Root", () => {
    expect(factory.agents).toBeDefined();
    expect(factory.context).toBeDefined();
    expect(factory.reasoning).toBeDefined();
    expect(factory.tools).toBeDefined();
    expect(factory.planning).toBeDefined();
    expect(factory.decisions).toBeDefined();
    expect(factory.policies).toBeDefined();
    expect(factory.memory).toBeDefined();
    expect(factory.events).toBeDefined();
    expect(factory.prompts).toBeDefined();
    expect(factory.approvals).toBeDefined();
  });

  it("should compile context with correlation and causation IDs", async () => {
    const builder = factory.context.createContextBuilder();
    const context = await builder.buildContextForInvoice(
      "inv-001",
      "evt-overdue-123",
      "invoice.overdue",
      "corr-abc-999",
      "caus-xyz-888"
    );

    expect(context.props.invoiceId).toBe("inv-001");
    expect(context.props.correlationId).toBe("corr-abc-999");
    expect(context.props.causationId).toBe("caus-xyz-888");

    // Immutability protection check
    expect(() => {
      (context.props as any).correlationId = "hacker-leak";
    }).toThrow();
  });

  it("should evaluate ModelBasedReasoner using abstract IModelProvider", async () => {
    const provider = new MockModelProvider();
    const reasoner = new ModelBasedReasoner(provider);
    const builder = factory.context.createContextBuilder();

    const context = await builder.buildContextForInvoice("inv-risk-777", "evt-4", "invoice.overdue");
    const decision = await reasoner.reason(context, "InvoiceAgent");

    expect(decision.props.selectedAction).toBe("SEND_REMINDER");
    expect(decision.props.reasoningSummary).toContain("MockModelProvider");
    expect(decision.props.confidence).toBe(0.95);
  });

  it("should freeze ToolRegistry post-construction to block runtime changes", () => {
    const registry = factory.tools.createToolRegistry();
    
    // Attempting to register a dummy tool should fail on a frozen registry
    const dummyTool = {
      descriptor: {
        id: "tool_dummy",
        name: "DummyTool",
        description: "Test description",
        permissions: [],
        riskLevel: "LOW" as const,
        requiredApproval: false
      },
      execute: async () => {}
    };

    expect(() => {
      registry.register(dummyTool);
    }).toThrow();
  });

  it("should generate plans with idempotency keys and step statuses", () => {
    const builder = new PlanBuilder();
    const validator = new PlanValidator();

    const decision = {
      props: {
        decisionId: "dec-plan-test",
        agentId: "InvoiceAgent",
        contextSnapshot: {} as any,
        reasoningSummary: "Send a reminder",
        selectedAction: "SEND_REMINDER",
        actionPayload: { invoiceId: "inv-900", customerId: "cust-900", type: "email" },
        confidence: 0.99,
        alternatives: [],
        policyResult: "ALLOW" as const,
        createdAt: new Date()
      }
    };

    const plan = builder.buildPlan(decision);
    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].status).toBe("PENDING");
    expect(plan.steps[0].idempotencyKey).toContain("plan_dec-plan-test_");

    const validation = validator.validate(plan);
    expect(validation.isValid).toBe(true);
  });

  it("should evaluate spending policies and trigger human approval workflows", async () => {
    const memory = factory.memory.getMemoryStore();
    memory.clear();
    const telemetry = new TelemetryEmitter();
    const contextBuilder = factory.context.createContextBuilder();
    const reasoner = factory.reasoning.createRuleReasoner();
    const tools = factory.tools.createToolRegistry();

    const invoiceAgent = factory.agents.createInvoiceAgent(contextBuilder, reasoner);
    const paymentAgent = factory.agents.createPaymentAgent(contextBuilder, reasoner);
    const planBuilder = factory.planning.createPlanBuilder();
    const policyEvaluator = factory.policies.createPolicyEvaluator();
    const approvalManager = factory.approvals.getApprovalManager();
    approvalManager.clear();

    const engine = factory.execution.createExecutionEngine(tools, memory, telemetry);
    engine.clearCompletedKeys();

    const coordinator = factory.events.createEventHandlers(
      invoiceAgent,
      paymentAgent,
      planBuilder,
      policyEvaluator,
      engine,
      memory,
      telemetry,
      approvalManager
    );
    coordinator.clearProcessedEvents();

    // 1. Setup payment context with high refund amount
    const decisionRefund = {
      props: {
        decisionId: "dec-high-refund",
        agentId: "PaymentAgent",
        contextSnapshot: { props: {} } as any,
        reasoningSummary: "High amount refund trigger",
        selectedAction: "REFUND",
        actionPayload: { paymentId: "pay-reconcile-999", amount: 1500.0 }, // Exceeds spending limit limit ($500)
        confidence: 0.99,
        alternatives: [],
        policyResult: "ALLOW" as const,
        createdAt: new Date()
      }
    } as any;

    const policyRes = policyEvaluator.evaluate(decisionRefund);
    expect(policyRes).toBe("HUMAN_APPROVAL_REQUIRED");

    // 2. Simulate workflow coordinator intercepts and registers Approval Request
    const plan = planBuilder.buildPlan(decisionRefund);
    let executionResumed = false;

    const req = approvalManager.registerRequest(plan.planId, decisionRefund.props.decisionId, "Verify high refund", async () => {
      executionResumed = true;
      return await engine.executePlan(plan, testMediator);
    });

    expect(req.status).toBe("PENDING");
    expect(approvalManager.listPending().length).toBe(1);

    // 3. Approve request manually via manager, verifying callback resumption
    const runResult = await approvalManager.approve(req.id);
    expect(runResult.success).toBe(true);
    expect(executionResumed).toBe(true);
    expect(req.status).toBe("APPROVED");
    expect(approvalManager.listPending().length).toBe(0);
  });

  it("should resume plans from failed checkpoints without duplicate execution", async () => {
    const memory = factory.memory.getMemoryStore();
    const telemetry = new TelemetryEmitter();
    const tools = factory.tools.createToolRegistry();
    const engine = factory.execution.createExecutionEngine(tools, memory, telemetry);
    engine.clearCompletedKeys();

    // 1. Create a plan with two steps
    const step1 = {
      stepId: "step_check_1",
      description: "Step 1",
      toolName: "SendNotificationTool",
      payload: { reference: "ref_step1", subject: "S1", body: "B1" },
      status: "COMPLETED" as const, // Already completed checkpoint
      idempotencyKey: "idem_step1_check",
      result: { isSuccess: true }
    };

    const step2 = {
      stepId: "step_check_2",
      description: "Step 2",
      toolName: "SendNotificationTool",
      payload: { reference: "ref_step2", subject: "S2", body: "B2" },
      status: "PENDING" as const,
      idempotencyKey: "idem_step2_check"
    };

    const plan = {
      planId: "plan_checkpoint_test",
      decisionId: "dec_check",
      steps: [step1, step2],
      createdAt: new Date()
    };

    // 2. Resume plan
    const res = await engine.resumePlan(plan, testMediator);
    expect(res.success).toBe(true);
    
    // Check step status updates
    expect(step1.status).toBe("COMPLETED");
    expect(step2.status).toBe("COMPLETED");
    
    // Check that step1 was skipped (resume guarantee)
    expect(res.results["step_check_1"].skipped).toBe(true);
    expect(res.results["step_check_2"].success).toBe(true);
  });

  it("should enforce event deduplication checks in EventHandlers", async () => {
    const memory = factory.memory.getMemoryStore();
    memory.clear();
    const telemetry = new TelemetryEmitter();
    const contextBuilder = factory.context.createContextBuilder();
    const reasoner = factory.reasoning.createRuleReasoner();
    const tools = factory.tools.createToolRegistry();

    const invoiceAgent = factory.agents.createInvoiceAgent(contextBuilder, reasoner);
    const paymentAgent = factory.agents.createPaymentAgent(contextBuilder, reasoner);
    const planBuilder = factory.planning.createPlanBuilder();
    const policyEvaluator = factory.policies.createPolicyEvaluator();
    const approvalManager = factory.approvals.getApprovalManager();
    approvalManager.clear();

    const engine = factory.execution.createExecutionEngine(tools, memory, telemetry);
    engine.clearCompletedKeys();

    const coordinator = factory.events.createEventHandlers(
      invoiceAgent,
      paymentAgent,
      planBuilder,
      policyEvaluator,
      engine,
      memory,
      telemetry,
      approvalManager
    );
    coordinator.clearProcessedEvents();

    const event = {
      id: "evt-dup-check-999",
      paymentId: "pay-dedup-999",
      type: "payment.received"
    };

    // 1. First trigger
    const firstRes = await coordinator.handlePaymentReceived(event, testMediator);
    expect(firstRes.success).toBe(true);
    expect(memory.getExecutionHistory().length).toBe(1);

    // 2. Second duplicate trigger (deduplicated)
    const secondRes = await coordinator.handlePaymentReceived(event, testMediator);
    expect(secondRes.success).toBe(true);
    expect(memory.getExecutionHistory().length).toBe(1); // Audit log count remains 1, execution bypassed
  });

  it("should separate Operational Memory from Audit Records", () => {
    const store = factory.memory.getMemoryStore();
    store.clear();

    const decision = {
      props: {
        decisionId: "dec-sep-test",
        selectedAction: "RECONCILE_PAYMENT",
        contextSnapshot: {
          props: { customerId: "cust-separation" }
        }
      }
    } as any;

    store.saveDecision(decision);

    // Verify operational lookup
    const op = store.getDecisionHistory("cust-separation");
    expect(op.length).toBe(1);
    expect(op[0].props.decisionId).toBe("dec-sep-test");

    // Verify audit log lookup
    const audit = store.getAuditRecords();
    expect(audit.length).toBe(1);
    expect(audit[0].type).toBe("DECISION");
    expect(Object.isFrozen(audit[0])).toBe(true); // Immutable audit record
  });
});
