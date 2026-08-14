import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Organization } from "../aggregates/Organization.js";
import { UserId } from "../../identity/value-objects/UserId.js";

/**
 * Domain Service enforcing business policy rules for administrative organization actions.
 */
export class OrganizationPolicy {
  /**
   * Verifies if the target user is eligible to receive ownership transfer.
   */
  public validateOwnershipTransfer(org: Organization, targetUserId: UserId): Result<void> {
    const targetMember = org.members.find((m) => m.userId.equals(targetUserId));
    if (!targetMember) {
      return Result.fail(ResultError.conflict("New owner must be a member of the organization."));
    }
    if (targetMember.userId.equals(org.ownerId)) {
      return Result.fail(ResultError.conflict("User is already the owner of the organization."));
    }
    return Result.ok();
  }

  /**
   * Verifies if the organization is eligible to be deleted by the given actor.
   */
  public validateCanDelete(org: Organization, actorUserId: UserId): Result<void> {
    if (!org.ownerId.equals(actorUserId)) {
      return Result.fail(ResultError.unauthorized("Only the owner can delete the organization."));
    }
    return Result.ok();
  }
}
