import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface SettlementReferenceProps {
  value: string;
}

/**
 * Value Object representing a validated commercial settlement reference (e.g. SET-2027-000081).
 */
export class SettlementReference extends ValueObject<SettlementReferenceProps> {
  private constructor(props: SettlementReferenceProps) {
    super(props);
  }

  /**
   * Creates a SettlementReference.
   */
  public static create(value: string): Result<SettlementReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Settlement reference cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("SET-")) {
      return Result.fail(
        ResultError.validation(`Invalid settlement reference: '${value}'. Must start with 'SET-'.`)
      );
    }
    return Result.ok(new SettlementReference({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
