import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface OrganizationSlugProps {
  value: string;
}

/**
 * Value Object representing a unique, human-friendly URL identifier for an organization (e.g. acme-corp).
 */
export class OrganizationSlug extends ValueObject<OrganizationSlugProps> {
  private constructor(props: OrganizationSlugProps) {
    super(props);
  }

  /**
   * Creates and validates an OrganizationSlug.
   */
  public static create(value: string): Result<OrganizationSlug> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Organization slug cannot be empty."));
    }
    const trimmed = value.trim().toLowerCase();

    // Regex enforcing lowercase letters, numbers, and hyphens
    const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!pattern.test(trimmed)) {
      return Result.fail(
        ResultError.validation(
          `Invalid organization slug format: '${value}'. Only lowercase alphanumeric characters and hyphens are allowed.`
        )
      );
    }

    return Result.ok(new OrganizationSlug({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
