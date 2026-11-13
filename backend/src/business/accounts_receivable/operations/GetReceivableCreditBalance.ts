import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { CreditAmount } from "../value-objects/CreditAmount.js";

/**
 * Returns the unapplied credit the account holds in the given currency.
 */
export function getReceivableCreditBalance(
  account: AccountsReceivable,
  currency: string
): CreditAmount {
  return account.getCreditBalance(currency);
}
