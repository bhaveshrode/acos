import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

/**
 * Domain Service managing email verification parameters and restrictions.
 */
export class EmailVerificationPolicy {
  private readonly tokenLifespanHours: number;
  private readonly blockedDomains: string[];

  constructor(tokenLifespanHours: number = 24, blockedDomains: string[] = []) {
    this.tokenLifespanHours = tokenLifespanHours;
    this.blockedDomains = blockedDomains.map((d) => d.toLowerCase());
  }

  /**
   * Checks if the email domain is blocked by security parameters.
   */
  public validateEmailDomain(email: string): Result<void> {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) {
      return Result.fail(ResultError.validation("Invalid email address domain structure."));
    }
    if (this.blockedDomains.includes(domain)) {
      return Result.fail(
        ResultError.conflict(`Email domain '${domain}' is blocked by security policy.`)
      );
    }
    return Result.ok();
  }

  /**
   * Generates the UTC expiration date/time for verification tokens.
   */
  public getExpirationDate(): Date {
    return new Date(Date.now() + this.tokenLifespanHours * 60 * 60 * 1000);
  }
}
