import { Result } from "../../result/Result.js";

export interface WorkflowInstance {
  instanceId: string;
  definitionId: string;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "PAUSED";
  currentState: string;
  variables: Record<string, any>;
}

/**
 * Interface representing a workflow orchestrator engine.
 */
export interface IWorkflowEngine {
  /**
   * Starts a new workflow instance.
   */
  startWorkflow(
    definitionId: string,
    inputVariables: Record<string, any>
  ): Promise<Result<WorkflowInstance>>;

  /**
   * Pauses an active workflow instance.
   */
  pauseWorkflow(instanceId: string): Promise<Result<void>>;

  /**
   * Resumes a paused workflow instance.
   */
  resumeWorkflow(instanceId: string): Promise<Result<WorkflowInstance>>;

  /**
   * Retrieves the status details of an active workflow instance.
   */
  getWorkflowStatus(instanceId: string): Promise<Result<WorkflowInstance>>;
}
