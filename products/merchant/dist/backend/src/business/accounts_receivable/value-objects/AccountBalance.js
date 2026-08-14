import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object summarizing a customer's total financial position.
 */
export class AccountBalance extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an AccountBalance.
     */
    static create(outstandingBalance, creditBalance, currency) {
        if (!currency || currency.trim() === "") {
            return Result.fail(ResultError.validation("Currency must be specified."));
        }
        if (outstandingBalance.currency !== currency || creditBalance.currency !== currency) {
            return Result.fail(ResultError.conflict("Currency mismatch in AccountBalance properties."));
        }
        return Result.ok(new AccountBalance({ outstandingBalance, creditBalance, currency }));
    }
    get outstandingBalance() { return this.props.outstandingBalance; }
    get creditBalance() { return this.props.creditBalance; }
    get currency() { return this.props.currency; }
    /**
     * Returns the net balance (Outstanding - Credit).
     */
    get netBalanceAmount() {
        return this.props.outstandingBalance.amount - this.props.creditBalance.amount;
    }
}
