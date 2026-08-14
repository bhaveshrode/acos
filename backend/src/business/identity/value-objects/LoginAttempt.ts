import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface LoginAttemptProps {
  timestamp: Date;
  ipAddress: string;
  successful: boolean;
}

/**
 * Value Object representing a single authentication login attempt record.
 * Used for security auditing and tracking lockouts.
 */
export class LoginAttempt extends ValueObject<LoginAttemptProps> {
  private constructor(props: LoginAttemptProps) {
    super(props);
  }

  /**
   * Creates a LoginAttempt record.
   */
  public static create(
    timestamp: Date,
    ipAddress: string,
    successful: boolean
  ): Result<LoginAttempt> {
    if (!timestamp) {
      return Result.fail(ResultError.validation("Login attempt timestamp is required."));
    }
    if (!ipAddress || ipAddress.trim() === "") {
      return Result.fail(ResultError.validation("Login attempt IP address cannot be empty."));
    }
    return Result.ok(new LoginAttempt({ timestamp, ipAddress: ipAddress.trim(), successful }));
  }

  public get timestamp(): Date {
    return this.props.timestamp;
  }

  public get ipAddress(): string {
    return this.props.ipAddress;
  }

  public get successful(): boolean {
    return this.props.successful;
  }
}
