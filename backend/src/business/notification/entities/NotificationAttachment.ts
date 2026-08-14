import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

export interface NotificationAttachmentProps {
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

/**
 * Child Entity representing an attachment associated with a notification message.
 */
export class NotificationAttachment extends Entity<UniqueEntityID> {
  private props: NotificationAttachmentProps;

  constructor(id: UniqueEntityID, props: NotificationAttachmentProps) {
    super(id);
    this.props = props;
  }

  public get fileName(): string { return this.props.fileName; }
  public get fileUrl(): string { return this.props.fileUrl; }
  public get mimeType(): string { return this.props.mimeType; }
}
