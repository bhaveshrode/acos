import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Settlement } from "../aggregates/Settlement.js";
import { SettlementStatus } from "../enums/SettlementStatus.js";
import { ReversalReason } from "../enums/ReversalReason.js";

/**
 * Domain Service enforcing business and administrative rules on Settlement lifecycle changes.
 */
export class SettlementPolicy {
  /**
   * Asserts if a settlement is permitted to be cancelled.
   */
  public validateCancellationRules(settlement: Settlement): Result<void> {
    if (settlement.status !== SettlementStatus.PENDING && settlement.status !== SettlementStatus.CONFIRMING) {
      return Result.fail(
        ResultError.conflict(`Cannot cancel a settlement in state ${settlement.status}.`)
      );
    }
    return Result.ok();
  }

  /**
   * Asserts if a settlement is permitted to be reversed.
   */
  public validateReversalPermissions(settlement: Settlement, reason: ReversalReason): Result<void> {
    if (settlement.status !== SettlementStatus.SETTLED) {
      return Result.fail(
        ResultError.conflict(`Only completed (SETTLED) settlements can be reversed. Current status: ${settlement.status}.`)
      );
    }
    
    // Administrative override check or any other business logic could go here
    if (!Object.values(ReversalReason).includes(reason)) {
      return Result.fail(
        ResultError.validation(`Invalid reversal reason provided: ${reason}.`)
      );
    }

    return Result.ok();
  }
}
