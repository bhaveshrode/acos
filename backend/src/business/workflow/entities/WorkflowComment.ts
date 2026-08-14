import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface WorkflowCommentProps {
  content: string;
  actor: UserId;
  createdAt: Date;
}

/**
 * Child Entity representing commentary added during task reviews.
 */
export class WorkflowComment extends Entity<UniqueEntityID> {
  private props: WorkflowCommentProps;

  constructor(id: UniqueEntityID, props: WorkflowCommentProps) {
    super(id);
    this.props = props;
  }

  public get content(): string { return this.props.content; }
  public get actor(): UserId { return this.props.actor; }
  public get createdAt(): Date { return this.props.createdAt; }
}
