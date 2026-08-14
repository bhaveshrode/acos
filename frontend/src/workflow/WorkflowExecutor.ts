import { WorkflowStep } from "./WorkflowStep.js";
import { WorkflowContext } from "./WorkflowContext.js";

/**
 * WorkflowExecutor coordinating sequential and parallel execution outputs.
 */
export class WorkflowExecutor {
  public async executeSequential(steps: WorkflowStep[], context: WorkflowContext): Promise<any[]> {
    const results: any[] = [];
    for (const step of steps) {
      results.push(await step.execute(context));
    }
    return results;
  }
}
