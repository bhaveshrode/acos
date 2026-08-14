import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invitee joins the organization.
 */
export class MemberJoined extends BaseDomainEvent {
    userId;
    constructor(organizationId, userId) {
        super(organizationId, "Organization");
        this.userId = userId;
    }
}
