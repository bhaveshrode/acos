import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface VerificationTokenProps {
  token: string;
  expiresAt: Date;
}

/**
 * Value Object representing a single-use token for email identity verification.
 */
export class VerificationToken extends ValueObject<VerificationTokenProps> {
  private constructor(props: VerificationTokenProps) {
    super(props);
  }

  /**
   * Creates a VerificationToken Value Object.
   */
  public static create(token: string, expiresAt: Date): Result<VerificationToken> {
    if (!token || token.trim() === "") {
      return Result.fail(ResultError.validation("Verification token value cannot be empty."));
    }
    if (!expiresAt) {
      return Result.fail(ResultError.validation("Verification token expiration date is required."));
    }
    return Result.ok(new VerificationToken({ token: token.trim(), expiresAt }));
  }

  public get token(): string {
    return this.props.token;
  }

  public get expiresAt(): Date {
    return this.props.expiresAt;
  }

  public get isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }
}
