import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CustomerNumberProps {
  value: string;
}

/**
 * Value Object representing a human-readable customer serial identifier (e.g., CUST-00042).
 */
export class CustomerNumber extends ValueObject<CustomerNumberProps> {
  private constructor(props: CustomerNumberProps) {
    super(props);
  }

  /**
   * Creates and validates a CustomerNumber.
   */
  public static create(value: string): Result<CustomerNumber> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Customer number cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("CUST-")) {
      return Result.fail(
        ResultError.validation(`Invalid customer number format: '${value}'. Must start with 'CUST-'.`)
      );
    }
    return Result.ok(new CustomerNumber({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
