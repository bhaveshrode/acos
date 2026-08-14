import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";
import { PaymentMethodType } from "../enums/PaymentMethodType.js";

/**
 * Domain Service enforcing systemic validations on payment transactions.
 */
export class PaymentPolicy {
  /**
   * Asserts if the transaction hash is unique, blocking transaction replay attacks.
   */
  public validateUniqueTransactionHash(
    hash: TransactionHash,
    hashExists: boolean
  ): Result<void> {
    if (hashExists) {
      return Result.fail(
        ResultError.conflict(
          `Transaction hash '${hash.value}' is already registered in ACOS.`
        )
      );
    }
    return Result.ok();
  }

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
