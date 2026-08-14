import { IntelligenceEventHandlers } from "../events/IntelligenceEventHandlers.js";
import { InvoiceAgent } from "../agents/InvoiceAgent.js";
import { PaymentAgent } from "../agents/PaymentAgent.js";
import { PlanBuilder } from "../planning/PlanBuilder.js";
import { PolicyEvaluator } from "../policies/PolicyEvaluator.js";
import { ExecutionEngine } from "../execution/ExecutionEngine.js";
import { MemoryStore } from "../memory/MemoryStore.js";
import { TelemetryEmitter } from "../observability/TelemetryEmitter.js";
import { ApprovalManager } from "../policies/ApprovalManager.js";

export class EventFactory {
  public createEventHandlers(
    invoiceAgent: InvoiceAgent,
    paymentAgent: PaymentAgent,
    planBuilder: PlanBuilder,
    policyEvaluator: PolicyEvaluator,
    executionEngine: ExecutionEngine,
    memoryStore: MemoryStore,
    telemetryEmitter: TelemetryEmitter,
    approvalManager: ApprovalManager
  ): IntelligenceEventHandlers {
    return new IntelligenceEventHandlers(
      invoiceAgent,
      paymentAgent,
      planBuilder,
      policyEvaluator,
      executionEngine,
      memoryStore,
      telemetryEmitter,
      approvalManager
    );
  }
}
