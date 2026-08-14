import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface CollectionActionProps {
  actionType: string;
  notes: string;
  performedBy: UserId;
  timestamp: Date;
}

/**
 * Child Entity representing an action taken to collect outstanding debts.
 */
export class CollectionAction extends Entity<UniqueEntityID> {
  private props: CollectionActionProps;

  constructor(id: UniqueEntityID, props: CollectionActionProps) {
    super(id);
    this.props = props;
  }

  public get actionType(): string { return this.props.actionType; }
  public get notes(): string { return this.props.notes; }
  public get performedBy(): UserId { return this.props.performedBy; }
  public get timestamp(): Date { return this.props.timestamp; }
}
