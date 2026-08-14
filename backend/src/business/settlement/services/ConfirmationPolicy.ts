import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";

/**
 * Domain Service enforcing progression policies on settlement confirmations.
 */
export class ConfirmationPolicy {
  /**
   * Validates that the confirmation progression is valid (i.e. count cannot decrease).
   */
  public validateConfirmationProgression(
    newCount: ConfirmationCount,
    currentCount: ConfirmationCount
  ): Result<void> {
    if (newCount.value < currentCount.value) {
      return Result.fail(
        ResultError.conflict(
          `Confirmation count cannot decrease. Attempted: ${newCount.value}, Current: ${currentCount.value}.`
        )
      );
    }
    return Result.ok();
  }
}
