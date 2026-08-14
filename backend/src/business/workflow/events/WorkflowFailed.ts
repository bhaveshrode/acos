import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a workflow instance fails.
 */
export class WorkflowFailed extends BaseDomainEvent {
  public readonly reason: string;

  constructor(workflowId: string, reason: string) {
    super(workflowId, "Workflow");
    this.reason = reason;
  }
}
