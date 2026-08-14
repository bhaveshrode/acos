import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { AssignmentReference } from "../value-objects/AssignmentReference.js";

export interface WorkflowAssignmentProps {
  assignee: AssignmentReference;
  assignedAt: Date;
}

/**
 * Child Entity representing an assignment record for tracking step ownership.
 */
export class WorkflowAssignment extends Entity<UniqueEntityID> {
  private props: WorkflowAssignmentProps;

  constructor(id: UniqueEntityID, props: WorkflowAssignmentProps) {
    super(id);
    this.props = props;
  }

  public get assignee(): AssignmentReference { return this.props.assignee; }
  public get assignedAt(): Date { return this.props.assignedAt; }
}
