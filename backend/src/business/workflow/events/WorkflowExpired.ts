import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a workflow's overall deadline is breached.
 */
export class WorkflowExpired extends BaseDomainEvent {
  constructor(workflowId: string) {
    super(workflowId, "Workflow");
  }
}
