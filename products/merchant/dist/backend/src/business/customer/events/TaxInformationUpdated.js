import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a customer's tax registration or numbers are changed.
 */
export class TaxInformationUpdated extends BaseDomainEvent {
    taxIdentifier;
    constructor(customerId, taxIdentifier) {
        super(customerId, "Customer");
        this.taxIdentifier = taxIdentifier;
    }
}
