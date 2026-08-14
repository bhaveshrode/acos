import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a customer's channel notification options are updated.
 */
export class CommunicationPreferencesChanged extends BaseDomainEvent {
    preferences;
    constructor(customerId, preferences) {
        super(customerId, "Customer");
        this.preferences = preferences;
    }
}
