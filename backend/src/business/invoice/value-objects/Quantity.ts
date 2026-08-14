import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface QuantityProps {
  value: number;
}

/**
 * Value Object representing a positive quantity count.
 */
export class Quantity extends ValueObject<QuantityProps> {
  private constructor(props: QuantityProps) {
    super(props);
  }

  /**
   * Creates a Quantity.
   */
  public static create(value: number): Result<Quantity> {
    if (isNaN(value) || value <= 0) {
      return Result.fail(
        ResultError.validation("Quantity must be a positive number greater than zero.")
      );
    }
    return Result.ok(new Quantity({ value }));
  }

  public get value(): number {
    return this.props.value;
  }
}
