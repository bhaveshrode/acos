import { Result } from "../../../foundation/result/Result.js";
import { Invoice } from "../aggregates/Invoice.js";
import { Money } from "../value-objects/Money.js";

/**
 * Records a confirmed payment against an issued invoice.
 *
 * `amountPaid` is the cumulative amount settled for this invoice, not the
 * delta of the latest payment. The aggregate decides the resulting status
 * (PARTIALLY_PAID, PAID, OVERPAID) and raises the matching domain event.
 */
export function recordPayment(invoice: Invoice, amountPaid: Money): Result<void> {
  return invoice.recordPayment(amountPaid);
}
