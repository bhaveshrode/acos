import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface PaymentAmountProps {
  value: Money;
}

/**
 * Value Object wrapping a Money amount and asserting it is strictly positive (> 0).
 */
export class PaymentAmount extends ValueObject<PaymentAmountProps> {
  private constructor(props: PaymentAmountProps) {
    super(props);
  }

  /**
   * Creates a PaymentAmount.
   */
  public static create(value: Money): Result<PaymentAmount> {
    if (value.amount <= 0) {
      return Result.fail(ResultError.validation("Payment amount must be greater than zero."));
    }
    return Result.ok(new PaymentAmount({ value }));
  }

  public get value(): Money {
    return this.props.value;
  }

  public get amount(): number { return this.props.value.amount; }
  public get currency(): string { return this.props.value.currency; }
}
