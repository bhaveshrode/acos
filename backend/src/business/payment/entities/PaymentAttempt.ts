import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";

export interface PaymentAttemptProps {
  timestamp: Date;
  status: PaymentStatus;
  gatewayResponse: string | null;
  errorCode: string | null;
}

/**
 * Child Entity representing a processing attempt with gateway telemetry response.
 */
export class PaymentAttempt extends Entity<UniqueEntityID> {
  private props: PaymentAttemptProps;

  constructor(id: UniqueEntityID, props: PaymentAttemptProps) {
    super(id);
    this.props = props;
  }

  public get timestamp(): Date { return this.props.timestamp; }
  public get status(): PaymentStatus { return this.props.status; }
  public get gatewayResponse(): string | null { return this.props.gatewayResponse; }
  public get errorCode(): string | null { return this.props.errorCode; }
}
