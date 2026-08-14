import { Result } from "../../../foundation/result/Result.js";
import { WorkflowReference } from "../value-objects/WorkflowReference.js";

/**
 * Domain Service generating sequential zero-padded WorkflowReference value objects (e.g. WRK-2027-000001).
 */
export class WorkflowReferenceGenerator {
  /**
   * Generates a reference code incorporating year and sequential padding.
   */
  public generate(year: number, sequence: number): Result<WorkflowReference> {
    const padded = String(sequence).padStart(6, "0");
    return WorkflowReference.create(`WRK-${year}-${padded}`);
  }
}
