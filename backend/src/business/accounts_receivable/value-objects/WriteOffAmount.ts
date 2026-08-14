import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface WriteOffAmountProps {
  value: Money;
}

/**
 * Value Object representing a write-off amount (>= 0).
 */
export class WriteOffAmount extends ValueObject<WriteOffAmountProps> {
  private constructor(props: WriteOffAmountProps) {
    super(props);
  }

  /**
   * Creates a WriteOffAmount.
   */
  public static create(value: Money): Result<WriteOffAmount> {
    if (value.amount < 0) {
      return Result.fail(ResultError.validation("Write-off amount cannot be negative."));
    }
    return Result.ok(new WriteOffAmount({ value }));
  }

  public get value(): Money {
    return this.props.value;
  }

  public get amount(): number { return this.props.value.amount; }
  public get currency(): string { return this.props.value.currency; }
}
