/**
 * WorkflowState enum capturing workflow lifecycles.
 */
export enum WorkflowState {
  Created = "Created",
  Running = "Running",
  Suspended = "Suspended",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Failed = "Failed"
}
