import { Specification } from "../../../foundation/core/Specification.js";
import { Settlement } from "../aggregates/Settlement.js";
import { SettlementStatus } from "../enums/SettlementStatus.js";

/**
 * Specification checking if a settlement's current state permits cancellation.
 * Only PENDING and CONFIRMING settlements can be cancelled.
 */
export class SettlementCanBeCancelled extends Specification<Settlement> {
  public isSatisfiedBy(candidate: Settlement): boolean {
    return (
      candidate.status === SettlementStatus.PENDING ||
      candidate.status === SettlementStatus.CONFIRMING
    );
  }
}
