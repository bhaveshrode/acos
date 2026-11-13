import { IWorkflow } from "./IWorkflow.js";
import { WorkflowContext } from "./WorkflowContext.js";
import { WorkflowState } from "./WorkflowState.js";

/**
 * BaseWorkflow implementing lifecycle suspensions and error triggers.
 */
export abstract class BaseWorkflow implements IWorkflow {
  public state: WorkflowState = WorkflowState.Created;

  constructor(public context: WorkflowContext) {}

  public async execute(): Promise<void> {
    this.state = WorkflowState.Running;
    try {
      await this.onExecute();
      this.state = WorkflowState.Completed;
    } catch (err) {
      this.state = WorkflowState.Failed;
      throw err;
    }
  }

  public suspend(): void {
    this.state = WorkflowState.Suspended;
    this.onSuspend();
  }

  public resume(): void {
    this.state = WorkflowState.Running;
    this.onResume();
  }

  protected abstract onExecute(): Promise<void>;
  protected onSuspend(): void {}
  protected onResume(): void {}
}
