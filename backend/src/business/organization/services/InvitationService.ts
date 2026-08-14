import { Result } from "../../../foundation/result/Result.js";
import { Organization } from "../aggregates/Organization.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Email } from "../../identity/value-objects/Email.js";
import { InvitationToken } from "../value-objects/InvitationToken.js";

/**
 * Domain Service orchestrating the initiation and registration of member invitations.
 */
export class InvitationService {
  private readonly tokenLifespanHours: number;

  constructor(tokenLifespanHours: number = 48) {
    this.tokenLifespanHours = tokenLifespanHours;
  }

  /**
   * Builds invitation metadata, generates a token, and logs the invitation on the organization aggregate.
   */
  public createInvitation(
    org: Organization,
    inviteeEmail: Email,
    generateToken: () => string
  ): Result<void> {
    const invitationId = new UniqueEntityID();
    const tokenRes = InvitationToken.create(generateToken());

    if (tokenRes.isFailure) {
      return Result.fail(tokenRes.error);
    }

    const expiresAt = new Date(Date.now() + this.tokenLifespanHours * 60 * 60 * 1000);

    return org.inviteMember(invitationId, inviteeEmail, tokenRes.value, expiresAt);
  }
}
