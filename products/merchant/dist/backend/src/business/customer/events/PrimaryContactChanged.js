import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when the primary contact person for a customer is updated.
 */
export class PrimaryContactChanged extends BaseDomainEvent {
    newPrimaryContactId;
    constructor(customerId, newPrimaryContactId) {
        super(customerId, "Customer");
        this.newPrimaryContactId = newPrimaryContactId;
    }
}
