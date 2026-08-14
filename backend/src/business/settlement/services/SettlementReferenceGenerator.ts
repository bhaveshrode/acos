import { Result } from "../../../foundation/result/Result.js";
import { SettlementReference } from "../value-objects/SettlementReference.js";

/**
 * Domain Service generating sequential zero-padded SettlementReference value objects.
 */
export class SettlementReferenceGenerator {
  /**
   * Generates a reference using the settlement year and sequence count.
   */
  public generate(year: number, sequence: number): Result<SettlementReference> {
    const padded = String(sequence).padStart(6, "0");
    return SettlementReference.create(`SET-${year}-${padded}`);
  }
}
