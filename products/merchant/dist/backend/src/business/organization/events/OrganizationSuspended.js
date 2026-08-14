import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an organization account is suspended.
 */
export class OrganizationSuspended extends BaseDomainEvent {
    reason;
    constructor(organizationId, reason) {
        super(organizationId, "Organization");
        this.reason = reason;
    }
}
