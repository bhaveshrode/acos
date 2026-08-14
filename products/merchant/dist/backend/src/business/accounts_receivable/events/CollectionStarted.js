import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a customer is entered into collection procedures.
 */
export class CollectionStarted extends BaseDomainEvent {
    reason;
    priority;
    constructor(receivableAccountId, reason, priority) {
        super(receivableAccountId, "AccountsReceivable");
        this.reason = reason;
        this.priority = priority;
    }
}
