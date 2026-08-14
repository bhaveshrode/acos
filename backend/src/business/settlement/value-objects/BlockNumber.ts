import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface BlockNumberProps {
  value: number;
}

/**
 * Value Object representing blockchain block height.
 */
export class BlockNumber extends ValueObject<BlockNumberProps> {
  private constructor(props: BlockNumberProps) {
    super(props);
  }

  /**
   * Creates a BlockNumber.
   */
  public static create(value: number): Result<BlockNumber> {
    if (isNaN(value) || !Number.isInteger(value) || value < 0) {
      return Result.fail(
        ResultError.validation("Block number must be a non-negative integer.")
      );
    }
    return Result.ok(new BlockNumber({ value }));
  }

  public get value(): number {
    return this.props.value;
  }
}
