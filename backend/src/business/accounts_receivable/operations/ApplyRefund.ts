import { Result } from "../../../foundation/result/Result.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Re-opens an invoice obligation in the receivable ledger after funds were
 * returned to the payer.
 */
export function applyRefund(ar: AccountsReceivable, invoiceId: InvoiceId, amount: Money): Result<void> {
  return ar.applyRefund(invoiceId, amount);
}
