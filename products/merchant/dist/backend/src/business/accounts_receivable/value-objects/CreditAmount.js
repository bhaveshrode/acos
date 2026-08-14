import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing customer's unapplied credit balance (>= 0).
 */
export class CreditAmount extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a CreditAmount.
     */
    static create(value) {
        if (value.amount < 0) {
            return Result.fail(ResultError.validation("Credit amount cannot be negative."));
        }
        return Result.ok(new CreditAmount({ value }));
    }
    get value() {
        return this.props.value;
    }
    get amount() { return this.props.value.amount; }
    get currency() { return this.props.value.currency; }
}
