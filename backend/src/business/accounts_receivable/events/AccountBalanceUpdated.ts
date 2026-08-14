import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { AccountBalance } from "../value-objects/AccountBalance.js";

/**
 * Domain event emitted when the overall account balance (outstanding & credit) changes.
 */
export class AccountBalanceUpdated extends BaseDomainEvent {
  public readonly balance: AccountBalance;

  constructor(receivableAccountId: string, balance: AccountBalance) {
    super(receivableAccountId, "AccountsReceivable");
    this.balance = balance;
  }
}
