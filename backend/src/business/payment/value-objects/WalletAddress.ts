import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface WalletAddressProps {
  value: string;
}

/**
 * Value Object representing a validated blockchain wallet public key address (e.g. 0x...).
 */
export class WalletAddress extends ValueObject<WalletAddressProps> {
  private constructor(props: WalletAddressProps) {
    super(props);
  }

  /**
   * Creates a WalletAddress.
   */
  public static create(value: string): Result<WalletAddress> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Wallet address cannot be empty."));
    }
    const clean = value.trim();
    if (clean.startsWith("0x")) {
      const pattern = /^0x[a-fA-F0-9]{40}$/;
      if (!pattern.test(clean)) {
        return Result.fail(ResultError.validation("Invalid EVM wallet address format."));
      }
    }
    return Result.ok(new WalletAddress({ value: clean }));
  }

  public get value(): string {
    return this.props.value;
  }
}
