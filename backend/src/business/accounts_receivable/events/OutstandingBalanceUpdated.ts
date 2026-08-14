import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OutstandingBalance } from "../value-objects/OutstandingBalance.js";

/**
 * Domain event emitted when the total outstanding debt balance changes.
 */
export class OutstandingBalanceUpdated extends BaseDomainEvent {
  public readonly balance: OutstandingBalance;

  constructor(receivableAccountId: string, balance: OutstandingBalance) {
    super(receivableAccountId, "AccountsReceivable");
    this.balance = balance;
  }
}
