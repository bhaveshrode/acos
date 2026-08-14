import { Result } from "../../../foundation/result/Result.js";
import { InvoiceNumber } from "../value-objects/InvoiceNumber.js";

/**
 * Domain Service generating sequential InvoiceNumber value objects incorporating current billing year.
 */
export class InvoiceNumberGenerator {
  /**
   * Generates an InvoiceNumber with current year and zero-padded sequence (e.g. INV-2027-000042).
   */
  public generate(year: number, sequence: number): Result<InvoiceNumber> {
    const padded = String(sequence).padStart(6, "0");
    return InvoiceNumber.create(`INV-${year}-${padded}`);
  }
}
