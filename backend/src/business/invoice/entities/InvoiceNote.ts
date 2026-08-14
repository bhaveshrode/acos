import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface InvoiceNoteProps {
  content: string;
  createdBy: UserId;
  createdAt: Date;
}

/**
 * Child Entity representing an internal note or audit record logged against an Invoice.
 */
export class InvoiceNote extends Entity<UniqueEntityID> {
  private props: InvoiceNoteProps;

  constructor(id: UniqueEntityID, props: InvoiceNoteProps) {
    super(id);
    this.props = props;
  }

  public get content(): string { return this.props.content; }
  public get createdBy(): UserId { return this.props.createdBy; }
  public get createdAt(): Date { return this.props.createdAt; }

  /**
   * Updates note content.
   */
  public updateContent(content: string): void {
    this.props.content = content;
  }
}
