import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when the total outstanding debt balance changes.
 */
export class OutstandingBalanceUpdated extends BaseDomainEvent {
    balance;
    constructor(receivableAccountId, balance) {
        super(receivableAccountId, "AccountsReceivable");
        this.balance = balance;
    }
}
