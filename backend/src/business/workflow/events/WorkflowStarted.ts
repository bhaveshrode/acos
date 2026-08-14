import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a Workflow instance transitions to running.
 */
export class WorkflowStarted extends BaseDomainEvent {
  constructor(workflowId: string) {
    super(workflowId, "Workflow");
  }
}
