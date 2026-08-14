import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Email } from "../../identity/value-objects/Email.js";
import { InvitationToken } from "../value-objects/InvitationToken.js";
import { InvitationStatus } from "../enums/InvitationStatus.js";

export interface InvitationProps {
  inviteeEmail: Email;
  token: InvitationToken;
  expiresAt: Date;
  status: InvitationStatus;
}

/**
 * Child Entity representing an issued invitation to join the organization.
 */
export class Invitation extends Entity<UniqueEntityID> {
  private props: InvitationProps;

  constructor(id: UniqueEntityID, props: InvitationProps) {
    super(id);
    this.props = props;
  }

  public get inviteeEmail(): Email { return this.props.inviteeEmail; }
  public get token(): InvitationToken { return this.props.token; }
  public get expiresAt(): Date { return this.props.expiresAt; }
  public get status(): InvitationStatus { return this.props.status; }

  /**
   * Checks if the invitation's expiration timestamp has passed.
   */
  public get isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  /**
   * Transitions invitation to ACCEPTED.
   */
  public accept(): void {
    this.props.status = InvitationStatus.ACCEPTED;
  }

  /**
   * Transitions invitation to EXPIRED.
   */
  public expire(): void {
    this.props.status = InvitationStatus.EXPIRED;
  }

  /**
   * Transitions invitation to REVOKED.
   */
  public revoke(): void {
    this.props.status = InvitationStatus.REVOKED;
  }
}
