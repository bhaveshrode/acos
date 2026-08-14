/**
 * Enum representing the execution status of a Workflow instance.
 */
export enum WorkflowStatus {
  DRAFT = "DRAFT",
  RUNNING = "RUNNING",
  WAITING = "WAITING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED"
}
