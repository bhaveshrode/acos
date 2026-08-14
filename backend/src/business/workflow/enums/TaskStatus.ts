/**
 * Enum representing the current state of a task within a workflow.
 */
export enum TaskStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  SKIPPED = "SKIPPED"
}
