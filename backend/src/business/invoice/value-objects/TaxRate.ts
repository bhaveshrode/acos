import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface TaxRateProps {
  value: number;
}

/**
 * Value Object representing a tax rate percentage (0 to 100).
 */
export class TaxRate extends ValueObject<TaxRateProps> {
  private constructor(props: TaxRateProps) {
    super(props);
  }

  /**
   * Creates a TaxRate.
   */
  public static create(value: number): Result<TaxRate> {
    if (isNaN(value) || value < 0 || value > 100) {
      return Result.fail(
        ResultError.validation("Tax rate must be a percentage between 0 and 100.")
      );
    }
    return Result.ok(new TaxRate({ value }));
  }

  public get value(): number {
    return this.props.value;
  }
}
