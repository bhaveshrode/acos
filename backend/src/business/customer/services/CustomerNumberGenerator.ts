import { Result } from "../../../foundation/result/Result.js";
import { CustomerNumber } from "../value-objects/CustomerNumber.js";

/**
 * Domain Service generating formatted, zero-padded CustomerNumber value objects.
 */
export class CustomerNumberGenerator {
  /**
   * Generates a CustomerNumber from an incremental sequence index.
   */
  public generate(nextSequence: number): Result<CustomerNumber> {
    const padded = String(nextSequence).padStart(6, "0");
    return CustomerNumber.create(`CUST-${padded}`);
  }
}
