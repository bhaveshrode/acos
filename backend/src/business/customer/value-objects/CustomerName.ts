import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CustomerNameProps {
  value: string;
}

/**
 * Value Object representing a validated customer name.
 */
export class CustomerName extends ValueObject<CustomerNameProps> {
  private constructor(props: CustomerNameProps) {
    super(props);
  }

  /**
   * Creates a CustomerName.
   */
  public static create(value: string): Result<CustomerName> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Customer name cannot be empty."));
    }
    const trimmed = value.trim();
    if (trimmed.length > 100) {
      return Result.fail(ResultError.validation("Customer name cannot exceed 100 characters."));
    }
    return Result.ok(new CustomerName({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
