import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";

/**
 * Applies the customer's available credit to an outstanding invoice,
 * consuming the oldest credits first. Credit is only fungible within its
 * currency, so credits in another currency are never drawn on.
 */
export function applyCustomerCredit(
  account: AccountsReceivable,
  invoiceId: InvoiceId,
  amount: Money
): Result<void> {
  if (amount.amount <= 0) {
    return Result.fail(ResultError.conflict("Credit application amount must be positive."));
  }

  const entry = account.entries.find((candidate) => candidate.invoiceId.equals(invoiceId));
  if (!entry) {
    return Result.fail(ResultError.notFound(`Invoice entry '${invoiceId.value}' not found.`));
  }
  if (entry.remainingBalance.currency !== amount.currency) {
    return Result.fail(ResultError.conflict("Currency mismatch in credit application."));
  }
  if (amount.amount > entry.remainingBalance.amount) {
    return Result.fail(
      ResultError.conflict(
        `Applied credit amount exceeds invoice remaining balance: ${entry.remainingBalance.amount}.`
      )
    );
  }

  const candidates = account.customerCredits
    .filter(
      (credit) =>
        credit.remainingBalance.currency === amount.currency && credit.remainingBalance.amount > 0
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const available = candidates.reduce((total, credit) => total + credit.remainingBalance.amount, 0);
  if (amount.amount > available) {
    return Result.fail(ResultError.conflict(`Insufficient credit balance. Available: ${available}.`));
  }

  let remaining = amount.amount;
  for (const credit of candidates) {
    if (remaining <= 0) break;
    const chunk = Math.min(remaining, credit.remainingBalance.amount);
    const applied = account.applyCredit(credit.id, invoiceId, Money.create(chunk, amount.currency).value);
    if (applied.isFailure) {
      return applied;
    }
    remaining -= chunk;
  }

  return Result.ok();
}
