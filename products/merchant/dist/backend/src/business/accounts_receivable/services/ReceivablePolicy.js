import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Domain Service enforcing general commercial business rules on Accounts Receivable accounts.
 */
export class ReceivablePolicy {
    /**
     * Validates if a write-off amount can be approved by the given auditor.
     */
    validateWriteOffPermissions(ar, amount, approvedBy) {
        if (!approvedBy || approvedBy.value.trim() === "") {
            return Result.fail(ResultError.validation("Write-off approval requires a valid UserId."));
        }
        const outstanding = ar.getOutstandingBalance(amount.currency);
        if (amount.amount > outstanding.amount) {
            return Result.fail(ResultError.conflict(`Write-off amount ${amount.amount} exceeds net outstanding debt ${outstanding.amount}.`));
        }
        return Result.ok();
    }
    /**
     * Validates if the accounts receivable account can be closed.
     * Closure is only allowed if all outstanding entries are fully paid (0 remaining balance).
     */
    validateAccountClosure(ar) {
        const hasOutstanding = ar.entries.some((entry) => !entry.isPaid);
        if (hasOutstanding) {
            return Result.fail(ResultError.conflict("Cannot close a receivable account with outstanding debt."));
        }
        return Result.ok();
    }
    /**
     * Validates if the accounts receivable account can be reopened.
     */
    validateAccountReopening(ar) {
        return Result.ok();
    }
}
