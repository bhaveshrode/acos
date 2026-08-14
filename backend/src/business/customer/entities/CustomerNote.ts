import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface CustomerNoteProps {
  content: string;
  createdBy: UserId;
  createdAt: Date;
}

/**
 * Child Entity representing internal-only notes written about a customer.
 */
export class CustomerNote extends Entity<UniqueEntityID> {
  private props: CustomerNoteProps;

  constructor(id: UniqueEntityID, props: CustomerNoteProps) {
    super(id);
    this.props = props;
  }

  public get content(): string { return this.props.content; }
  public get createdBy(): UserId { return this.props.createdBy; }
  public get createdAt(): Date { return this.props.createdAt; }

  /**
   * Updates note text content.
   */
  public updateContent(content: string): void {
    this.props.content = content;
  }
}
