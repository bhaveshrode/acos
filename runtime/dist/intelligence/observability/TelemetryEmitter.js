export class TelemetryEmitter {
    metrics = [];
    trackDecisionLatency(agentId, ms) {
        this.recordMetric("intelligence.decision.latency", ms, { agentId });
    }
    trackModelRequest(model, tokens) {
        this.recordMetric("intelligence.model.tokens", tokens, { model });
    }
    trackSuccessRate(actionName, success) {
        this.recordMetric("intelligence.action.success", success ? 1 : 0, { actionName });
    }
    recordMetric(name, value, tags = {}) {
        this.metrics.push({
            name,
            value,
            tags,
            timestamp: new Date()
        });
    }
    getMetrics() {
        return this.metrics;
    }
    clear() {
        this.metrics.length = 0;
    }
}
