import { Result } from "../../../foundation/result/Result.js";
import { Invoice } from "../aggregates/Invoice.js";
import { Money } from "../value-objects/Money.js";

/**
 * Records money returned to the payer and re-opens the invoice obligation to
 * whatever the remaining net payment supports.
 */
export function recordRefund(invoice: Invoice, amountRefunded: Money, netPaid: Money): Result<void> {
  return invoice.recordRefund(amountRefunded, netPaid);
}
