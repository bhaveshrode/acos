import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when the overall account balance (outstanding & credit) changes.
 */
export class AccountBalanceUpdated extends BaseDomainEvent {
    balance;
    constructor(receivableAccountId, balance) {
        super(receivableAccountId, "AccountsReceivable");
        this.balance = balance;
    }
}
