import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";
import { ChannelType } from "../enums/ChannelType.js";
import { RecipientAddress } from "../value-objects/RecipientAddress.js";

export interface RecipientProps {
  userId: UserId | null;
  email: RecipientAddress | null;
  phone: RecipientAddress | null;
  channelPreferences: ChannelType[];
}

/**
 * Child Entity representing a target recipient and their delivery details.
 */
export class Recipient extends Entity<UniqueEntityID> {
  private props: RecipientProps;

  constructor(id: UniqueEntityID, props: RecipientProps) {
    super(id);
    this.props = props;
  }

  public get userId(): UserId | null { return this.props.userId; }
  public get email(): RecipientAddress | null { return this.props.email; }
  public get phone(): RecipientAddress | null { return this.props.phone; }
  public get channelPreferences(): readonly ChannelType[] { return Object.freeze([...this.props.channelPreferences]); }
}
