import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

export interface InvoiceAttachmentProps {
  fileName: string;
  fileUrl: string;
}

/**
 * Child Entity representing an uploaded supporting attachment for the Invoice.
 */
export class InvoiceAttachment extends Entity<UniqueEntityID> {
  private props: InvoiceAttachmentProps;

  constructor(id: UniqueEntityID, props: InvoiceAttachmentProps) {
    super(id);
    this.props = props;
  }

  public get fileName(): string { return this.props.fileName; }
  public get fileUrl(): string { return this.props.fileUrl; }
}
