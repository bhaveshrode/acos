import { InvoiceAgent } from "../agents/InvoiceAgent.js";
import { PaymentAgent } from "../agents/PaymentAgent.js";
import { PlanBuilder } from "../planning/PlanBuilder.js";
import { PolicyEvaluator } from "../policies/PolicyEvaluator.js";
import { ExecutionEngine } from "../execution/ExecutionEngine.js";
import { MemoryStore } from "../memory/MemoryStore.js";
import { TelemetryEmitter } from "../observability/TelemetryEmitter.js";
import { ApprovalManager } from "../policies/ApprovalManager.js";

export class IntelligenceEventHandlers {
  private readonly processedEvents = new Map<string, any>();

  constructor(
    private readonly invoiceAgent: InvoiceAgent,
    private readonly paymentAgent: PaymentAgent,
    private readonly planBuilder: PlanBuilder,
    private readonly policyEvaluator: PolicyEvaluator,
    private readonly executionEngine: ExecutionEngine,
    private readonly memoryStore: MemoryStore,
    private readonly telemetryEmitter: TelemetryEmitter,
    private readonly approvalManager: ApprovalManager
  ) {}

  public async handleOverdueInvoice(
    event: { id: string; invoiceId: string; type: string; correlationId?: string; causationId?: string },
    mediator: any
  ): Promise<any> {
    const eventId = event.id;
    
    if (this.processedEvents.has(eventId)) {
      this.telemetryEmitter.recordMetric("intelligence.event.deduplicated", 1, { eventId });
      return this.processedEvents.get(eventId);
    }

    const startTime = Date.now();
    const correlationId = event.correlationId || eventId;
    const causationId = event.causationId || eventId;

    const decision = await this.invoiceAgent.processEvent({
      ...event,
      id: eventId,
      correlationId,
      causationId
    });

    if (!decision || decision.props.selectedAction === "NONE") {
      const outcome = { success: false, reason: "No actionable decision or NONE action selected" };
      this.processedEvents.set(eventId, outcome);
      return outcome;
    }

    this.memoryStore.saveDecision(decision);
    this.telemetryEmitter.trackDecisionLatency(this.invoiceAgent.agentId, Date.now() - startTime);

    const policyResult = this.policyEvaluator.evaluate(decision);
    const evaluatedDecision = {
      ...decision,
      props: {
        ...decision.props,
        policyResult
      }
    };

    if (policyResult === "DENY") {
      this.memoryStore.saveExecution("plan_denied", false, { error: "Denied by Policy Evaluator" });
      const outcome = { success: false, reason: "Denied by Policy Evaluator" };
      this.processedEvents.set(eventId, outcome);
      return outcome;
    }

    const plan = this.planBuilder.buildPlan(evaluatedDecision);
    this.telemetryEmitter.recordMetric("intelligence.plan.created", 1);

    if (policyResult === "HUMAN_APPROVAL_REQUIRED") {
      const approvalRequest = this.approvalManager.registerRequest(
        plan.planId,
        decision.props.decisionId,
        `Spending limit exceeded or manual check needed for Action: ${decision.props.selectedAction}`,
        async () => {
          const res = await this.executionEngine.executePlan(plan, mediator);
          this.processedEvents.set(eventId, res);
          return res;
        }
      );

      const outcome = {
        success: false,
        status: "PENDING_APPROVAL",
        approvalRequestId: approvalRequest.id,
        planId: plan.planId,
        decisionId: decision.props.decisionId
      };
      this.processedEvents.set(eventId, outcome);
      return outcome;
    }

    const execRes = await this.executionEngine.executePlan(plan, mediator);
    this.processedEvents.set(eventId, execRes);
    return execRes;
  }

  public async handlePaymentReceived(
    event: { id: string; paymentId: string; type: string; correlationId?: string; causationId?: string },
    mediator: any
  ): Promise<any> {
    const eventId = event.id;

    if (this.processedEvents.has(eventId)) {
      this.telemetryEmitter.recordMetric("intelligence.event.deduplicated", 1, { eventId });
      return this.processedEvents.get(eventId);
    }

    const startTime = Date.now();
    const correlationId = event.correlationId || eventId;
    const causationId = event.causationId || eventId;

    const decision = await this.paymentAgent.processEvent({
      ...event,
      id: eventId,
      correlationId,
      causationId
    });

    if (!decision || decision.props.selectedAction === "NONE") {
      const outcome = { success: false, reason: "No actionable decision" };
      this.processedEvents.set(eventId, outcome);
      return outcome;
    }

    this.memoryStore.saveDecision(decision);
    this.telemetryEmitter.trackDecisionLatency(this.paymentAgent.agentId, Date.now() - startTime);

    const policyResult = this.policyEvaluator.evaluate(decision);
    const evaluatedDecision = {
      ...decision,
      props: {
        ...decision.props,
        policyResult
      }
    };

    if (policyResult === "DENY") {
      const outcome = { success: false, reason: "Denied by Policy Evaluator" };
      this.processedEvents.set(eventId, outcome);
      return outcome;
    }

    const plan = this.planBuilder.buildPlan(evaluatedDecision);

    if (policyResult === "HUMAN_APPROVAL_REQUIRED") {
      const approvalRequest = this.approvalManager.registerRequest(
        plan.planId,
        decision.props.decisionId,
        `Spending limit exceeded or manual check needed for Action: ${decision.props.selectedAction}`,
        async () => {
          const res = await this.executionEngine.executePlan(plan, mediator);
          this.processedEvents.set(eventId, res);
          return res;
        }
      );

      const outcome = {
        success: false,
        status: "PENDING_APPROVAL",
        approvalRequestId: approvalRequest.id,
        planId: plan.planId,
        decisionId: decision.props.decisionId
      };
      this.processedEvents.set(eventId, outcome);
      return outcome;
    }

    const execRes = await this.executionEngine.executePlan(plan, mediator);
    this.processedEvents.set(eventId, execRes);
    return execRes;
  }

  public clearProcessedEvents(): void {
    this.processedEvents.clear();
  }
}
