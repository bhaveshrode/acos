import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Email } from "../../identity/value-objects/Email.js";
import { InvitationToken } from "../value-objects/InvitationToken.js";

/**
 * Domain event emitted when a new member invitation token is created.
 */
export class MemberInvited extends BaseDomainEvent {
  public readonly inviteeEmail: Email;
  public readonly token: InvitationToken;

  constructor(organizationId: string, inviteeEmail: Email, token: InvitationToken) {
    super(organizationId, "Organization");
    this.inviteeEmail = inviteeEmail;
    this.token = token;
  }
}
