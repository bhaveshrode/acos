import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { CreditSource } from "../enums/CreditSource.js";
import { CreditAmount } from "../value-objects/CreditAmount.js";

/**
 * Domain event emitted when new unapplied customer credit is registered.
 */
export class CustomerCreditCreated extends BaseDomainEvent {
  public readonly source: CreditSource;
  public readonly amount: CreditAmount;

  constructor(
    receivableAccountId: string,
    source: CreditSource,
    amount: CreditAmount
  ) {
    super(receivableAccountId, "AccountsReceivable");
    this.source = source;
    this.amount = amount;
  }
}
