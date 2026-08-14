import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface WorkflowHistoryProps {
  action: string;
  actor: UserId | null;
  timestamp: Date;
}

/**
 * Child Entity representing an audit trail log inside the Workflow aggregate.
 */
export class WorkflowHistory extends Entity<UniqueEntityID> {
  private props: WorkflowHistoryProps;

  constructor(id: UniqueEntityID, props: WorkflowHistoryProps) {
    super(id);
    this.props = props;
  }

  public get action(): string { return this.props.action; }
  public get actor(): UserId | null { return this.props.actor; }
  public get timestamp(): Date { return this.props.timestamp; }
}
