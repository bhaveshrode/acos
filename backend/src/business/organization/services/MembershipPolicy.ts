import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Organization } from "../aggregates/Organization.js";
import { UserId } from "../../identity/value-objects/UserId.js";

/**
 * Domain Service enforcing membership rules and restrictions on organizations.
 */
export class MembershipPolicy {
  private readonly maxMembers: number;

  constructor(maxMembers: number = 20) {
    this.maxMembers = maxMembers;
  }

  /**
   * Validates if a user is allowed to join the organization based on caps and uniqueness.
   */
  public validateCanJoin(org: Organization, userId: UserId): Result<void> {
    // 1. Quota check
    if (org.members.length >= this.maxMembers) {
      return Result.fail(
        ResultError.conflict(
          `Organization has reached its maximum member limit of ${this.maxMembers}.`
        )
      );
    }

    // 2. Duplicate membership check
    const isMember = org.members.some((m) => m.userId.equals(userId));
    if (isMember) {
      return Result.fail(ResultError.conflict("User is already a member of this organization."));
    }

    return Result.ok();
  }
}
