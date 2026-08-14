import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a workflow instance is cancelled.
 */
export class WorkflowCancelled extends BaseDomainEvent {
  constructor(workflowId: string) {
    super(workflowId, "Workflow");
  }
}
