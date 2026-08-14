import { Specification } from "../../../foundation/core/Specification.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { ReceivableStatus } from "../enums/ReceivableStatus.js";

/**
 * Specification checking if a receivable account status allows a write-off.
 * Closed or already written-off accounts cannot be written off.
 */
export class ReceivableCanBeWrittenOff extends Specification<AccountsReceivable> {
  public isSatisfiedBy(candidate: AccountsReceivable): boolean {
    return (
      candidate.status !== ReceivableStatus.CLOSED &&
      candidate.status !== ReceivableStatus.WRITTEN_OFF
    );
  }
}
