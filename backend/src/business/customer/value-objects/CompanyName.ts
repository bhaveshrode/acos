import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CompanyNameProps {
  value: string;
}

/**
 * Value Object representing a customer's legal company name.
 */
export class CompanyName extends ValueObject<CompanyNameProps> {
  private constructor(props: CompanyNameProps) {
    super(props);
  }

  /**
   * Creates a CompanyName.
   */
  public static create(value: string): Result<CompanyName> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Company name cannot be empty."));
    }
    const trimmed = value.trim();
    if (trimmed.length > 100) {
      return Result.fail(ResultError.validation("Company name cannot exceed 100 characters."));
    }
    return Result.ok(new CompanyName({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
