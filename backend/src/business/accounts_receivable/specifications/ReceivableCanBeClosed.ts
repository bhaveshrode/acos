import { Specification } from "../../../foundation/core/Specification.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";

/**
 * Specification checking if a receivable account can be closed.
 * Accounts can only be closed if all registered obligations have been paid off.
 */
export class ReceivableCanBeClosed extends Specification<AccountsReceivable> {
  public isSatisfiedBy(candidate: AccountsReceivable): boolean {
    return !candidate.entries.some((entry) => !entry.isPaid);
  }
}
