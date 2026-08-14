import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface ExchangeRateProps {
  rate: number;
}

/**
 * Value Object representing a currency exchange conversion multiplier (> 0).
 */
export class ExchangeRate extends ValueObject<ExchangeRateProps> {
  private constructor(props: ExchangeRateProps) {
    super(props);
  }

  /**
   * Creates an ExchangeRate.
   */
  public static create(rate: number): Result<ExchangeRate> {
    if (isNaN(rate) || rate <= 0) {
      return Result.fail(
        ResultError.validation("Exchange rate must be a positive number greater than zero.")
      );
    }
    return Result.ok(new ExchangeRate({ rate }));
  }

  public get rate(): number {
    return this.props.rate;
  }
}
