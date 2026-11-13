import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";

/**
 * Ensures the invoice is tracked as an obligation on the account.
 *
 * Idempotent: an invoice already registered on the account is left untouched,
 * so reconciliation can be retried without duplicating entries.
 */
export function registerInvoiceObligation(
  account: AccountsReceivable,
  invoiceId: InvoiceId,
  amount: Money,
  dueDate: Date
): Result<void> {
  if (account.entries.some((entry) => entry.invoiceId.equals(invoiceId))) {
    return Result.ok();
  }
  return account.addInvoice(new UniqueEntityID(), invoiceId, amount, dueDate);
}
