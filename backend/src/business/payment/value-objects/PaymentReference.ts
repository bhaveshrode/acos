import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface PaymentReferenceProps {
  value: string;
}

/**
 * Value Object representing a validated commercial payment reference (e.g. PAY-2027-000001).
 */
export class PaymentReference extends ValueObject<PaymentReferenceProps> {
  private constructor(props: PaymentReferenceProps) {
    super(props);
  }

  /**
   * Creates a PaymentReference.
   */
  public static create(value: string): Result<PaymentReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Payment reference cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("PAY-")) {
      return Result.fail(
        ResultError.validation(`Invalid payment reference: '${value}'. Must start with 'PAY-'.`)
      );
    }
    return Result.ok(new PaymentReference({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
