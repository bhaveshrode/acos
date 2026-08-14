import { IntelligenceEventHandlers } from "../events/IntelligenceEventHandlers.js";
export class EventFactory {
    createEventHandlers(invoiceAgent, paymentAgent, planBuilder, policyEvaluator, executionEngine, memoryStore, telemetryEmitter, approvalManager) {
        return new IntelligenceEventHandlers(invoiceAgent, paymentAgent, planBuilder, policyEvaluator, executionEngine, memoryStore, telemetryEmitter, approvalManager);
    }
}
