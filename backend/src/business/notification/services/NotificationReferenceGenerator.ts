import { Result } from "../../../foundation/result/Result.js";
import { NotificationReference } from "../value-objects/NotificationReference.js";

/**
 * Domain Service generating sequential zero-padded NotificationReference value objects.
 */
export class NotificationReferenceGenerator {
  /**
   * Generates a reference using the current year and sequence count.
   */
  public generate(year: number, sequence: number): Result<NotificationReference> {
    const padded = String(sequence).padStart(6, "0");
    return NotificationReference.create(`NTF-${year}-${padded}`);
  }
}
