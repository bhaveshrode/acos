import { ConfirmationTracker } from "../confirmations/ConfirmationTracker.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * SettlementVerifier validating blockchain payment records finality milestones.
 */
export class SettlementVerifier {
  constructor(private readonly tracker: ConfirmationTracker) {}

  /**
   * Asserts whether a transaction hash has resolved completely.
   */
  public verifySettlement(txHash: string, requiredConfirmations: number = 12): Result<boolean> {
    const isFinal = this.tracker.isFinal(txHash, requiredConfirmations);
    if (!isFinal) {
      return Result.ok(false);
    }
    return Result.ok(true);
  }
}
