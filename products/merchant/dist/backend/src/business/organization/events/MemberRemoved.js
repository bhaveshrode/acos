import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a member is removed from an organization.
 */
export class MemberRemoved extends BaseDomainEvent {
    userId;
    constructor(organizationId, userId) {
        super(organizationId, "Organization");
        this.userId = userId;
    }
}
