import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface RefreshTokenProps {
  token: string;
  expiresAt: Date;
}

/**
 * Value Object representing a long-lived OAuth/session renewal refresh token.
 */
export class RefreshToken extends ValueObject<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps) {
    super(props);
  }

  /**
   * Creates a RefreshToken Value Object.
   */
  public static create(token: string, expiresAt: Date): Result<RefreshToken> {
    if (!token || token.trim() === "") {
      return Result.fail(ResultError.validation("Refresh token value cannot be empty."));
    }
    if (!expiresAt) {
      return Result.fail(ResultError.validation("Refresh token expiration date is required."));
    }
    return Result.ok(new RefreshToken({ token: token.trim(), expiresAt }));
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
