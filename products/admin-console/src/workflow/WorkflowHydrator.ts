import { IWorkflow } from "./IWorkflow.js";
import { WorkflowCheckpointManager } from "./WorkflowCheckpointManager.js";

/**
 * WorkflowHydrator restoring persisted execution contexts back onto workflows.
 */
export class WorkflowHydrator {
  constructor(private readonly checkpointManager: WorkflowCheckpointManager) {}

  public hydrate(workflow: IWorkflow): boolean {
    const snapshot = this.checkpointManager.getCheckpoint(workflow.context.metadata.id);
    if (snapshot) {
      if (typeof (workflow as any).hydrateState === "function") {
        (workflow as any).hydrateState(snapshot);
      }
      return true;
    }
    return false;
  }
}
