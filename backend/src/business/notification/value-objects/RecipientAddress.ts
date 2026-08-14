import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface RecipientAddressProps {
  value: string;
}

/**
 * Value Object representing a delivery target address (email, phone, webhook URL, etc.).
 */
export class RecipientAddress extends ValueObject<RecipientAddressProps> {
  private constructor(props: RecipientAddressProps) {
    super(props);
  }

  /**
   * Creates a RecipientAddress.
   */
  public static create(value: string): Result<RecipientAddress> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Recipient address cannot be empty."));
    }
    return Result.ok(new RecipientAddress({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
