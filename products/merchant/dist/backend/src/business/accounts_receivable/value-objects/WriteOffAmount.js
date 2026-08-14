import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a write-off amount (>= 0).
 */
export class WriteOffAmount extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a WriteOffAmount.
     */
    static create(value) {
        if (value.amount < 0) {
            return Result.fail(ResultError.validation("Write-off amount cannot be negative."));
        }
        return Result.ok(new WriteOffAmount({ value }));
    }
    get value() {
        return this.props.value;
    }
    get amount() { return this.props.value.amount; }
    get currency() { return this.props.value.currency; }
}
