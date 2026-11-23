import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when unapplied customer credit is returned to the payer
 * without re-opening the invoice it came from.
 */
export class CustomerCreditRefunded extends BaseDomainEvent {
  public readonly amount: Money;

  constructor(receivableAccountId: string, amount: Money) {
    super(receivableAccountId, "AccountsReceivable");
    this.amount = amount;
  }
}
