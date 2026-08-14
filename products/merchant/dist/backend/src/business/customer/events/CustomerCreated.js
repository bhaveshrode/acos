import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new Customer aggregate root is created.
 */
export class CustomerCreated extends BaseDomainEvent {
    organizationId;
    customerNumber;
    constructor(customerId, organizationId, customerNumber) {
        super(customerId, "Customer");
        this.organizationId = organizationId;
        this.customerNumber = customerNumber;
    }
}
