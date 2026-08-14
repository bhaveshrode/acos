import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { EscalationLevel } from "../enums/EscalationLevel.js";

/**
 * Domain event emitted when a workflow's escalation level increases.
 */
export class WorkflowEscalated extends BaseDomainEvent {
  public readonly newLevel: EscalationLevel;

  constructor(workflowId: string, newLevel: EscalationLevel) {
    super(workflowId, "Workflow");
    this.newLevel = newLevel;
  }
}
