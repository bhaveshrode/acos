import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new member invitation token is created.
 */
export class MemberInvited extends BaseDomainEvent {
    inviteeEmail;
    token;
    constructor(organizationId, inviteeEmail, token) {
        super(organizationId, "Organization");
        this.inviteeEmail = inviteeEmail;
        this.token = token;
    }
}
