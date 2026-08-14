import { Result } from "../../../foundation/result/Result.js";
import { PaymentReference } from "../value-objects/PaymentReference.js";

/**
 * Domain Service generating sequential zero-padded PaymentReference value objects (e.g. PAY-2027-000084).
 */
export class PaymentReferenceGenerator {
  /**
   * Generates a reference using the billing year and sequence count.
   */
  public generate(year: number, sequence: number): Result<PaymentReference> {
    const padded = String(sequence).padStart(6, "0");
    return PaymentReference.create(`PAY-${year}-${padded}`);
  }
}
