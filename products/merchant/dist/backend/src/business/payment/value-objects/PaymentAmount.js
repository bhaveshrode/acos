import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object wrapping a Money amount and asserting it is strictly positive (> 0).
 */
export class PaymentAmount extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PaymentAmount.
     */
    static create(value) {
        if (value.amount <= 0) {
            return Result.fail(ResultError.validation("Payment amount must be greater than zero."));
        }
        return Result.ok(new PaymentAmount({ value }));
    }
    get value() {
        return this.props.value;
    }
    get amount() { return this.props.value.amount; }
    get currency() { return this.props.value.currency; }
}
