import { IWorkflow } from "./IWorkflow.js";
import { WorkflowStep } from "./WorkflowStep.js";
import { WorkflowExecutor } from "./WorkflowExecutor.js";

/**
 * WorkflowCoordinator orchestrating complete workflow executions.
 */
export class WorkflowCoordinator {
  constructor(private readonly executor: WorkflowExecutor) {}

  public async coordinate(workflow: IWorkflow, steps: WorkflowStep[]): Promise<any[]> {
    return this.executor.executeSequential(steps, workflow.context);
  }
}
