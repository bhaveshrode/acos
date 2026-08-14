import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface CreditAmountProps {
  value: Money;
}

/**
 * Value Object representing customer's unapplied credit balance (>= 0).
 */
export class CreditAmount extends ValueObject<CreditAmountProps> {
  private constructor(props: CreditAmountProps) {
    super(props);
  }

  /**
   * Creates a CreditAmount.
   */
  public static create(value: Money): Result<CreditAmount> {
    if (value.amount < 0) {
      return Result.fail(ResultError.validation("Credit amount cannot be negative."));
    }
    return Result.ok(new CreditAmount({ value }));
  }

  public get value(): Money {
    return this.props.value;
  }

  public get amount(): number { return this.props.value.amount; }
  public get currency(): string { return this.props.value.currency; }
}
