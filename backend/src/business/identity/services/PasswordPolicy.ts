import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

/**
 * Domain Service enforcing password complexity rules.
 */
export class PasswordPolicy {
  private readonly minLength: number;

  constructor(minLength: number = 8) {
    this.minLength = minLength;
  }

  /**
   * Validates a candidate password string.
   */
  public validate(password: string): Result<void> {
    if (!password || password.length < this.minLength) {
      return Result.fail(
        ResultError.validation(`Password must be at least ${this.minLength} characters long.`)
      );
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
      return Result.fail(
        ResultError.validation(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
      );
    }

    return Result.ok();
  }
}
