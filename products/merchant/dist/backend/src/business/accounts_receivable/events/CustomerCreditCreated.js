import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when new unapplied customer credit is registered.
 */
export class CustomerCreditCreated extends BaseDomainEvent {
    source;
    amount;
    constructor(receivableAccountId, source, amount) {
        super(receivableAccountId, "AccountsReceivable");
        this.source = source;
        this.amount = amount;
    }
}
