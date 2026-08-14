import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface TransactionHashProps {
  value: string;
}

/**
 * Value Object representing a blockchain transaction hash.
 * Enforces basic structure formatting and hex length validations.
 */
export class TransactionHash extends ValueObject<TransactionHashProps> {
  private constructor(props: TransactionHashProps) {
    super(props);
  }

  /**
   * Creates a TransactionHash.
   */
  public static create(value: string): Result<TransactionHash> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Transaction hash cannot be empty."));
    }
    const clean = value.trim();
    if (clean.startsWith("0x")) {
      // Basic 64 hex character blockchain transaction signature check
      const pattern = /^0x([A-Fa-f0-9]{64})$/;
      if (!pattern.test(clean)) {
        return Result.fail(
          ResultError.validation("Invalid EVM transaction hash format. Must be 0x followed by 64 hex chars.")
        );
      }
    }
    return Result.ok(new TransactionHash({ value: clean }));
  }

  public get value(): string {
    return this.props.value;
  }
}
