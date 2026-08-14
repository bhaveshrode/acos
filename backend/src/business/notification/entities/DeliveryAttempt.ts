import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { ChannelType } from "../enums/ChannelType.js";
import { DeliveryResult } from "../enums/DeliveryResult.js";
import { DeliveryMetadata } from "../value-objects/DeliveryMetadata.js";

export interface DeliveryAttemptProps {
  channel: ChannelType;
  timestamp: Date;
  providerResponse: string | null;
  status: DeliveryResult;
  retryCount: number;
  metadata: DeliveryMetadata;
}

/**
 * Child Entity representing an execution dispatch attempt to a provider gateway.
 */
export class DeliveryAttempt extends Entity<UniqueEntityID> {
  private props: DeliveryAttemptProps;

  constructor(id: UniqueEntityID, props: DeliveryAttemptProps) {
    super(id);
    this.props = props;
  }

  public get channel(): ChannelType { return this.props.channel; }
  public get timestamp(): Date { return this.props.timestamp; }
  public get providerResponse(): string | null { return this.props.providerResponse; }
  public get status(): DeliveryResult { return this.props.status; }
  public get retryCount(): number { return this.props.retryCount; }
  public get metadata(): DeliveryMetadata { return this.props.metadata; }
}
