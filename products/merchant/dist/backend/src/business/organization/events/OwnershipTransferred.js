import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when organization ownership is transferred.
 */
export class OwnershipTransferred extends BaseDomainEvent {
    previousOwnerId;
    newOwnerId;
    constructor(organizationId, previousOwnerId, newOwnerId) {
        super(organizationId, "Organization");
        this.previousOwnerId = previousOwnerId;
        this.newOwnerId = newOwnerId;
    }
}
