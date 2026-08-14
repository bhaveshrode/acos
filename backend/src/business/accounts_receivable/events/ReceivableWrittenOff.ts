import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { WriteOffAmount } from "../value-objects/WriteOffAmount.js";
import { UserId } from "../../identity/value-objects/UserId.js";

/**
 * Domain event emitted when an outstanding obligation is written off.
 */
export class ReceivableWrittenOff extends BaseDomainEvent {
  public readonly amount: WriteOffAmount;
  public readonly approvedBy: UserId;

  constructor(
    receivableAccountId: string,
    amount: WriteOffAmount,
    approvedBy: UserId
  ) {
    super(receivableAccountId, "AccountsReceivable");
    this.amount = amount;
    this.approvedBy = approvedBy;
  }
}
