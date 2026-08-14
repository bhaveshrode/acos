import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a Customer is blocked.
 */
export class CustomerBlocked extends BaseDomainEvent {
    reason;
    constructor(customerId, reason) {
        super(customerId, "Customer");
        this.reason = reason;
    }
}
