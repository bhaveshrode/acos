import { Result } from "../../../foundation/result/Result.js";
import { Invoice } from "../aggregates/Invoice.js";

/**
 * Records that an issued invoice was delivered to the customer.
 *
 * Published on the kernel so consumers can mark an invoice sent without
 * reaching for the aggregate's full public method set.
 */
export function markInvoiceSent(invoice: Invoice): Result<void> {
  return invoice.markSent();
}
