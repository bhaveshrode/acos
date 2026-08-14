import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Settlement } from "../aggregates/Settlement.js";

/**
 * Domain Service evaluating whether a Settlement has reached finality.
 */
export class FinalityPolicy {
  /**
   * Evaluates if finality has been achieved.
   * Finality requires:
   * 1. The highest confirmation count must meet or exceed the confirmation threshold.
   * 2. The sum of recorded treasury receipt amounts must equal or exceed the settlement amount.
   */
  public isFinalityReached(settlement: Settlement): Result<void> {
    // 1. Check confirmation threshold
    let highestCount = 0;
    settlement.confirmations.forEach((conf) => {
      if (conf.count.value > highestCount) {
        highestCount = conf.count.value;
      }
    });

    if (highestCount < settlement.confirmationThreshold.value) {
      return Result.fail(
        ResultError.conflict(
          `Confirmation threshold not met. Required: ${settlement.confirmationThreshold.value}, Highest: ${highestCount}.`
        )
      );
    }

    // 2. Check treasury receipt presence and amount
    if (settlement.treasuryReceipts.length === 0) {
      return Result.fail(
        ResultError.conflict("No treasury receipts recorded. Cannot finalize settlement.")
      );
    }

    let totalReceived = 0;
    for (const receipt of settlement.treasuryReceipts) {
      if (receipt.receivedAmount.currency !== settlement.amount.currency) {
        return Result.fail(
          ResultError.conflict(
            `Currency mismatch in treasury receipt. Expected: ${settlement.amount.currency}, Found: ${receipt.receivedAmount.currency}.`
          )
        );
      }
      totalReceived += receipt.receivedAmount.amount;
    }

    if (totalReceived < settlement.amount.amount) {
      return Result.fail(
        ResultError.conflict(
          `Total received treasury amount (${totalReceived}) is less than required settlement amount (${settlement.amount.amount}).`
        )
      );
    }

    return Result.ok();
  }
}
