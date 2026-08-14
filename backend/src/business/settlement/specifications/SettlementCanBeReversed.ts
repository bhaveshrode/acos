import { Specification } from "../../../foundation/core/Specification.js";
import { Settlement } from "../aggregates/Settlement.js";
import { SettlementStatus } from "../enums/SettlementStatus.js";

/**
 * Specification checking if a settlement's current state permits reversal.
 * Only SETTLED settlements can be reversed.
 */
export class SettlementCanBeReversed extends Specification<Settlement> {
  public isSatisfiedBy(candidate: Settlement): boolean {
    return candidate.status === SettlementStatus.SETTLED;
  }
}
