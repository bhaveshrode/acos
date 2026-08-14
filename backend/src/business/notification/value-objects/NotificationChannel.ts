import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { ChannelType } from "../enums/ChannelType.js";
import { RecipientAddress } from "./RecipientAddress.js";

export interface NotificationChannelProps {
  type: ChannelType;
  address: RecipientAddress;
}

/**
 * Value Object combining a delivery channel type with a validated destination address.
 */
export class NotificationChannel extends ValueObject<NotificationChannelProps> {
  private constructor(props: NotificationChannelProps) {
    super(props);
  }

  /**
   * Creates a NotificationChannel.
   */
  public static create(type: ChannelType, address: RecipientAddress): Result<NotificationChannel> {
    if (!type) {
      return Result.fail(ResultError.validation("Channel type must be specified."));
    }
    if (!address) {
      return Result.fail(ResultError.validation("Recipient address must be specified."));
    }
    return Result.ok(new NotificationChannel({ type, address }));
  }

  public get type(): ChannelType { return this.props.type; }
  public get address(): RecipientAddress { return this.props.address; }
}
