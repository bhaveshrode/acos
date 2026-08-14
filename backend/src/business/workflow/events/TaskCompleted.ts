import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a task is completed.
 */
export class TaskCompleted extends BaseDomainEvent {
  public readonly taskId: string;

  constructor(workflowId: string, taskId: string) {
    super(workflowId, "Workflow");
    this.taskId = taskId;
  }
}
