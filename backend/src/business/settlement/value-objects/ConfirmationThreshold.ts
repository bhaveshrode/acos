import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface ConfirmationThresholdProps {
  value: number;
}

/**
 * Value Object representing a confirmation threshold.
 */
export class ConfirmationThreshold extends ValueObject<ConfirmationThresholdProps> {
  private constructor(props: ConfirmationThresholdProps) {
    super(props);
  }

  /**
   * Creates a ConfirmationThreshold.
   */
  public static create(value: number): Result<ConfirmationThreshold> {
    if (isNaN(value) || !Number.isInteger(value) || value < 0) {
      return Result.fail(
        ResultError.validation("Confirmation threshold must be a non-negative integer.")
      );
    }
    return Result.ok(new ConfirmationThreshold({ value }));
  }

  public get value(): number {
    return this.props.value;
  }
}
