import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { PaymentMethodType } from "../enums/PaymentMethodType.js";

export interface PaymentMethodProps {
  type: PaymentMethodType;
  details: string;
}

/**
 * Value Object representing a customer payment method structure.
 */
export class PaymentMethod extends ValueObject<PaymentMethodProps> {
  private constructor(props: PaymentMethodProps) {
    super(props);
  }

  /**
   * Creates a PaymentMethod.
   */
  public static create(type: PaymentMethodType, details: string): Result<PaymentMethod> {
    if (!details || details.trim() === "") {
      return Result.fail(ResultError.validation("Payment method details cannot be empty."));
    }
    return Result.ok(new PaymentMethod({ type, details: details.trim() }));
  }

  public get type(): PaymentMethodType { return this.props.type; }
  public get details(): string { return this.props.details; }
}
