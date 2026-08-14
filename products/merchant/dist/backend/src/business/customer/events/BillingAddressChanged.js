import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a customer's billing address is updated.
 */
export class BillingAddressChanged extends BaseDomainEvent {
    address;
    constructor(customerId, address) {
        super(customerId, "Customer");
        this.address = address;
    }
}
