import { Result } from "../../../foundation/result/Result.js";
import { Invoice } from "../aggregates/Invoice.js";

/**
 * Transitions a draft invoice to ISSUED.
 *
 * Published on the kernel so consumers can issue an invoice without reaching
 * for the aggregate's full public method set. The aggregate remains the owner
 * of the invariant; this operation is the named capability on the surface.
 */
export function issueInvoice(invoice: Invoice): Result<void> {
  return invoice.issue();
}
