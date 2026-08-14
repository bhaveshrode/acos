import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a customer's net outstanding debt amount (>= 0).
 */
export class OutstandingBalance extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an OutstandingBalance.
     */
    static create(value) {
        if (value.amount < 0) {
            return Result.fail(ResultError.validation("Outstanding balance cannot be negative."));
        }
        return Result.ok(new OutstandingBalance({ value }));
    }
    get value() {
        return this.props.value;
    }
    get amount() { return this.props.value.amount; }
    get currency() { return this.props.value.currency; }
}
