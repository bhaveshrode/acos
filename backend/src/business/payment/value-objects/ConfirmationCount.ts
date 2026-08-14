import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface ConfirmationCountProps {
  value: number;
}

/**
 * Value Object representing a transaction block confirmation count (>= 0).
 */
export class ConfirmationCount extends ValueObject<ConfirmationCountProps> {
  private constructor(props: ConfirmationCountProps) {
    super(props);
  }

  /**
   * Creates a ConfirmationCount.
   */
  public static create(value: number): Result<ConfirmationCount> {
    if (isNaN(value) || !Number.isInteger(value) || value < 0) {
      return Result.fail(
        ResultError.validation("Confirmation count must be a non-negative integer.")
      );
    }
    return Result.ok(new ConfirmationCount({ value }));
  }

  public get value(): number {
    return this.props.value;
  }
}
