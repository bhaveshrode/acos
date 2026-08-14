import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface OutstandingBalanceProps {
  value: Money;
}

/**
 * Value Object representing a customer's net outstanding debt amount (>= 0).
 */
export class OutstandingBalance extends ValueObject<OutstandingBalanceProps> {
  private constructor(props: OutstandingBalanceProps) {
    super(props);
  }

  /**
   * Creates an OutstandingBalance.
   */
  public static create(value: Money): Result<OutstandingBalance> {
    if (value.amount < 0) {
      return Result.fail(ResultError.validation("Outstanding balance cannot be negative."));
    }
    return Result.ok(new OutstandingBalance({ value }));
  }

  public get value(): Money {
    return this.props.value;
  }

  public get amount(): number { return this.props.value.amount; }
  public get currency(): string { return this.props.value.currency; }
}
