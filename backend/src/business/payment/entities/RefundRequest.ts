import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Money } from "../../invoice/value-objects/Money.js";
import { RefundStatus } from "../enums/RefundStatus.js";

export interface RefundRequestProps {
  amount: Money;
  reason: string;
  status: RefundStatus;
  requestedAt: Date;
}

/**
 * Child Entity representing a refund request initiated against a payment.
 */
export class RefundRequest extends Entity<UniqueEntityID> {
  private props: RefundRequestProps;

  constructor(id: UniqueEntityID, props: RefundRequestProps) {
    super(id);
    this.props = props;
  }

  public get amount(): Money { return this.props.amount; }
  public get reason(): string { return this.props.reason; }
  public get status(): RefundStatus { return this.props.status; }
  public get requestedAt(): Date { return this.props.requestedAt; }

  /**
   * Sets status to APPROVED.
   */
  public approve(): void {
    this.props.status = RefundStatus.APPROVED;
  }

  /**
   * Sets status to REJECTED.
   */
  public reject(): void {
    this.props.status = RefundStatus.REJECTED;
  }

  /**
   * Sets status to COMPLETED.
   */
  public complete(): void {
    this.props.status = RefundStatus.COMPLETED;
  }
}
