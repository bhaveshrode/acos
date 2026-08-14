import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new Organization is registered, assigning its owner.
 */
export class OrganizationCreated extends BaseDomainEvent {
    ownerId;
    constructor(organizationId, ownerId) {
        super(organizationId, "Organization");
        this.ownerId = ownerId;
    }
}
