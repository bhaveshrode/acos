import { WorkflowContext } from "./WorkflowContext.js";
import { WorkflowState } from "./WorkflowState.js";

/**
 * IWorkflow interface defining mounting, suspending, resuming, and executing contracts.
 */
export interface IWorkflow {
  context: WorkflowContext;
  state: WorkflowState;
  execute(): Promise<void>;
  suspend(): void;
  resume(): void;
}
