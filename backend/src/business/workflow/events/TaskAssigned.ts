import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { AssignmentReference } from "../value-objects/AssignmentReference.js";

/**
 * Domain event emitted when a workflow step is assigned to an actor.
 */
export class TaskAssigned extends BaseDomainEvent {
  public readonly taskId: string;
  public readonly assignee: AssignmentReference;

  constructor(workflowId: string, taskId: string, assignee: AssignmentReference) {
    super(workflowId, "Workflow");
    this.taskId = taskId;
    this.assignee = assignee;
  }
}
