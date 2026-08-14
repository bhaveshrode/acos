import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface EmailProps {
  value: string;
}

/**
 * Value Object representing a validated and normalized email address.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  /**
   * Validates and normalizes an email string, returning an Email instance.
   * @param value The raw email string.
   */
  public static create(value: string): Result<Email> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Email address cannot be empty."));
    }
    const normalized = value.trim().toLowerCase();

    // Standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return Result.fail(ResultError.validation(`Invalid email address format: '${value}'`));
    }

    return Result.ok(new Email({ value: normalized }));
  }

  public get value(): string {
    return this.props.value;
  }
}
