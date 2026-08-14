import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { SettlementAmount } from "../value-objects/SettlementAmount.js";

/**
 * Domain event emitted when a treasury receipt is successfully recorded.
 */
export class TreasuryReceiptRecorded extends BaseDomainEvent {
  public readonly wallet: string;
  public readonly receivedAmount: SettlementAmount;

  constructor(
    settlementId: string,
    wallet: string,
    receivedAmount: SettlementAmount
  ) {
    super(settlementId, "Settlement");
    this.wallet = wallet;
    this.receivedAmount = receivedAmount;
  }
}
