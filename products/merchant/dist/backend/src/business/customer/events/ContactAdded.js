import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new Contact is added to a Customer profile.
 */
export class ContactAdded extends BaseDomainEvent {
    contactId;
    constructor(customerId, contactId) {
        super(customerId, "Customer");
        this.contactId = contactId;
    }
}
