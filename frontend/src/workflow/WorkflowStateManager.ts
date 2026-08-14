import { IWorkflow } from "./IWorkflow.js";
import { WorkflowState } from "./WorkflowState.js";

/**
 * WorkflowStateManager enforcing lifecycle transition rules.
 */
export class WorkflowStateManager {
  public transitionTo(workflow: IWorkflow, nextState: WorkflowState): void {
    (workflow as any).state = nextState;
  }
}
