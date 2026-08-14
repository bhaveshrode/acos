import { Plan, PlanStep } from "../planning/Plan.js";
import { ToolRegistry } from "../tools/ToolRegistry.js";
import { MemoryStore } from "../memory/MemoryStore.js";
import { TelemetryEmitter } from "../observability/TelemetryEmitter.js";

export class ExecutionEngine {
  private readonly completedKeys = new Set<string>();

  constructor(
    private readonly toolRegistry: ToolRegistry,
    private readonly memoryStore: MemoryStore,
    private readonly telemetryEmitter: TelemetryEmitter
  ) {}

  public async executePlan(
    plan: Plan,
    mediator: any
  ): Promise<{ success: boolean; results: Record<string, any>; error?: string }> {
    return this.runPlanSteps(plan, mediator);
  }

  public async resumePlan(
    plan: Plan,
    mediator: any
  ): Promise<{ success: boolean; results: Record<string, any>; error?: string }> {
    this.telemetryEmitter.recordMetric("intelligence.plan.resumed", 1, { planId: plan.planId });
    return this.runPlanSteps(plan, mediator);
  }

  private async runPlanSteps(
    plan: Plan,
    mediator: any
  ): Promise<{ success: boolean; results: Record<string, any>; error?: string }> {
    const results: Record<string, any> = {};
    const startTime = Date.now();
    let overallSuccess = true;
    let failedStepError: string | undefined;

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
        const mutableStep = step as any;
        mutableStep.status = "COMPLETED";
        results[step.stepId] = {
          success: true,
          idempotentSkip: true,
          toolName: step.toolName,
          result: step.result
        };
        continue;
      }

      const mutableStep = step as any;
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
      } catch (err: any) {
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

  public clearCompletedKeys(): void {
    this.completedKeys.clear();
  }
}
