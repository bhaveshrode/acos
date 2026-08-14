import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CurrencyProps {
  value: string;
}

/**
 * Value Object representing a ISO 4217 three-letter currency code (e.g., USD, EUR, GBP).
 */
export class Currency extends ValueObject<CurrencyProps> {
  private constructor(props: CurrencyProps) {
    super(props);
  }

  /**
   * Creates a Currency.
   */
  public static create(value: string): Result<Currency> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Currency code cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    const pattern = /^[A-Z]{3}$/;
    if (!pattern.test(trimmed)) {
      return Result.fail(
        ResultError.validation(
          `Invalid currency code: '${value}'. Must be a 3-letter uppercase ISO code.`
        )
      );
    }
    return Result.ok(new Currency({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
