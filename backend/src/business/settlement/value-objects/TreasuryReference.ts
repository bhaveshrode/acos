import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface TreasuryReferenceProps {
  value: string;
}

/**
 * Value Object representing an internal treasury identifier.
 */
export class TreasuryReference extends ValueObject<TreasuryReferenceProps> {
  private constructor(props: TreasuryReferenceProps) {
    super(props);
  }

  /**
   * Creates a TreasuryReference.
   */
  public static create(value: string): Result<TreasuryReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Treasury reference cannot be empty."));
    }
    return Result.ok(new TreasuryReference({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
