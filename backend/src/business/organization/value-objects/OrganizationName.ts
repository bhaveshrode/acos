import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface OrganizationNameProps {
  value: string;
}

/**
 * Value Object representing an validated business name.
 */
export class OrganizationName extends ValueObject<OrganizationNameProps> {
  private constructor(props: OrganizationNameProps) {
    super(props);
  }

  /**
   * Creates an OrganizationName instance.
   */
  public static create(value: string): Result<OrganizationName> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Organization name cannot be empty."));
    }
    const trimmed = value.trim();
    if (trimmed.length > 100) {
      return Result.fail(ResultError.validation("Organization name cannot exceed 100 characters."));
    }
    return Result.ok(new OrganizationName({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
