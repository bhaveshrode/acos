import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { PaymentMethodType } from "../enums/PaymentMethodType.js";

/**
 * Domain Service enforcing systemic validations on payment transactions.
 */
export class PaymentPolicy {
  /**
   * Asserts if the selected payment method type is supported.
   */
  public validateAllowedMethod(
    methodType: PaymentMethodType,
    allowedMethods: PaymentMethodType[]
  ): Result<void> {
    if (!allowedMethods.includes(methodType)) {
      return Result.fail(
        ResultError.validation(
          `Payment method type '${methodType}' is disabled under current settings.`
        )
      );
    }
    return Result.ok();
  }
}
