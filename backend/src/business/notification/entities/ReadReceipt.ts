import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { ChannelType } from "../enums/ChannelType.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface ReadReceiptProps {
  readAt: Date;
  channel: ChannelType;
  readerId: UserId | null;
}

/**
 * Child Entity representing a receipt log confirming a message has been read or viewed by the recipient.
 */
export class ReadReceipt extends Entity<UniqueEntityID> {
  private props: ReadReceiptProps;

  constructor(id: UniqueEntityID, props: ReadReceiptProps) {
    super(id);
    this.props = props;
  }

  public get readAt(): Date { return this.props.readAt; }
  public get channel(): ChannelType { return this.props.channel; }
  public get readerId(): UserId | null { return this.props.readerId; }
}
