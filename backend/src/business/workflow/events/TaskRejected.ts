import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a task is rejected.
 */
export class TaskRejected extends BaseDomainEvent {
  public readonly taskId: string;
  public readonly reason: string;

  constructor(workflowId: string, taskId: string, reason: string) {
    super(workflowId, "Workflow");
    this.taskId = taskId;
    this.reason = reason;
  }
}
