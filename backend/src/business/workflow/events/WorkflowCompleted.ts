import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when all tasks are completed successfully.
 */
export class WorkflowCompleted extends BaseDomainEvent {
  constructor(workflowId: string) {
    super(workflowId, "Workflow");
  }
}
