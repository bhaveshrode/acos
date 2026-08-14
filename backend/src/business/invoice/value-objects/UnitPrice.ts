import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "./Money.js";

export interface UnitPriceProps {
  price: Money;
}

/**
 * Value Object representing a non-negative price per unit.
 */
export class UnitPrice extends ValueObject<UnitPriceProps> {
  private constructor(props: UnitPriceProps) {
    super(props);
  }

  /**
   * Creates a UnitPrice.
   */
  public static create(price: Money): Result<UnitPrice> {
    if (price.amount < 0) {
      return Result.fail(ResultError.validation("Unit price cannot be negative."));
    }
    return Result.ok(new UnitPrice({ price }));
  }

  public get price(): Money {
    return this.props.price;
  }

  public get amount(): number { return this.props.price.amount; }
  public get currency(): string { return this.props.price.currency; }
}
