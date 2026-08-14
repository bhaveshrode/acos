import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { DiscountType } from "../enums/DiscountType.js";

export interface DiscountProps {
  type: DiscountType;
  value: number;
}

/**
 * Value Object representing a fixed or percentage reduction.
 */
export class Discount extends ValueObject<DiscountProps> {
  private constructor(props: DiscountProps) {
    super(props);
  }

  /**
   * Creates a Discount.
   */
  public static create(type: DiscountType, value: number): Result<Discount> {
    if (isNaN(value) || value < 0) {
      return Result.fail(ResultError.validation("Discount value cannot be negative."));
    }
    if (type === DiscountType.PERCENTAGE && value > 100) {
      return Result.fail(ResultError.validation("Percentage discount cannot exceed 100%."));
    }
    return Result.ok(new Discount({ type, value }));
  }

  public get type(): DiscountType { return this.props.type; }
  public get value(): number { return this.props.value; }
}
