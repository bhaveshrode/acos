export class ExecutionEngine {
    toolRegistry;
    memoryStore;
    telemetryEmitter;
    completedKeys = new Set();
    constructor(toolRegistry, memoryStore, telemetryEmitter) {
        this.toolRegistry = toolRegistry;
        this.memoryStore = memoryStore;
        this.telemetryEmitter = telemetryEmitter;
    }
    async executePlan(plan, mediator) {
        return this.runPlanSteps(plan, mediator);
    }
    async resumePlan(plan, mediator) {
        this.telemetryEmitter.recordMetric("intelligence.plan.resumed", 1, { planId: plan.planId });
        return this.runPlanSteps(plan, mediator);
    }
    async runPlanSteps(plan, mediator) {
        const results = {};
        const startTime = Date.now();
        let overallSuccess = true;
        let failedStepError;
        for (const step of plan.steps) {
            if (step.status === "COMPLETED") {
                results[step.stepId] = {
                    success: true,
                    skipped: true,
                    toolName: step.toolName,
                    result: step.result
                };
                continue;
            }
            if (this.completedKeys.has(step.idempotencyKey)) {
                // Enforce frozen object modifications workaround:
                // We mutate properties on step directly since it is a mutable array element reference
                const mutableStep = step;
                mutableStep.status = "COMPLETED";
                results[step.stepId] = {
                    success: true,
                    idempotentSkip: true,
                    toolName: step.toolName,
                    result: step.result
                };
                continue;
            }
            const mutableStep = step;
            mutableStep.status = "RUNNING";
            try {
                const tool = this.toolRegistry.getTool(step.toolName);
                const res = await tool.execute(step.payload, mediator);
                mutableStep.status = "COMPLETED";
                mutableStep.result = res;
                this.completedKeys.add(step.idempotencyKey);
                results[step.stepId] = {
                    success: true,
                    toolName: step.toolName,
                    result: res
                };
                this.telemetryEmitter.trackSuccessRate(step.toolName, true);
            }
            catch (err) {
                const errMsg = err.message || String(err);
                mutableStep.status = "FAILED";
                mutableStep.error = errMsg;
                results[step.stepId] = {
                    success: false,
                    toolName: step.toolName,
                    error: errMsg
                };
                this.telemetryEmitter.trackSuccessRate(step.toolName, false);
                overallSuccess = false;
                failedStepError = errMsg;
                break; // Pause/break execution sequence
            }
        }
        const duration = Date.now() - startTime;
        this.memoryStore.saveExecution(plan.planId, overallSuccess, results);
        this.telemetryEmitter.trackSuccessRate("executePlan", overallSuccess);
        this.telemetryEmitter.recordMetric("intelligence.plan.duration", duration, { planId: plan.planId });
        if (!overallSuccess) {
            return {
                success: false,
                results,
                error: `Execution failed: ${failedStepError}`
            };
        }
        return {
            success: true,
            results
        };
    }
    clearCompletedKeys() {
        this.completedKeys.clear();
    }
}
