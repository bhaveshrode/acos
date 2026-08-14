import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface EmailAddressProps {
  value: string;
}

/**
 * Value Object representing a validated and normalized email address.
 */
export class EmailAddress extends ValueObject<EmailAddressProps> {
  private constructor(props: EmailAddressProps) {
    super(props);
  }

  /**
   * Creates an EmailAddress.
   */
  public static create(value: string): Result<EmailAddress> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Email cannot be empty."));
    }
    const trimmed = value.trim().toLowerCase();
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(trimmed)) {
      return Result.fail(ResultError.validation(`Invalid email address: '${value}'`));
    }
    return Result.ok(new EmailAddress({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
