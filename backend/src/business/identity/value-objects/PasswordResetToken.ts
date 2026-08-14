import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface PasswordResetTokenProps {
  token: string;
  expiresAt: Date;
}

/**
 * Value Object representing a single-use token generated for password recovery resets.
 */
export class PasswordResetToken extends ValueObject<PasswordResetTokenProps> {
  private constructor(props: PasswordResetTokenProps) {
    super(props);
  }

  /**
   * Creates a PasswordResetToken Value Object.
   */
  public static create(token: string, expiresAt: Date): Result<PasswordResetToken> {
    if (!token || token.trim() === "") {
      return Result.fail(ResultError.validation("Password reset token value cannot be empty."));
    }
    if (!expiresAt) {
      return Result.fail(ResultError.validation("Password reset token expiration date is required."));
    }
    return Result.ok(new PasswordResetToken({ token: token.trim(), expiresAt }));
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
