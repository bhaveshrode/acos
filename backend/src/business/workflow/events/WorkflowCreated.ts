import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { WorkflowReference } from "../value-objects/WorkflowReference.js";

/**
 * Domain event emitted when a new Workflow instance is created.
 */
export class WorkflowCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;
  public readonly reference: WorkflowReference;

  constructor(
    workflowId: string,
    organizationId: OrganizationId,
    reference: WorkflowReference
  ) {
    super(workflowId, "Workflow");
    this.organizationId = organizationId;
    this.reference = reference;
  }
}
