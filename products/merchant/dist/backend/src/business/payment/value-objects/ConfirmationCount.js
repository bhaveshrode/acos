import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a transaction block confirmation count (>= 0).
 */
export class ConfirmationCount extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a ConfirmationCount.
     */
    static create(value) {
        if (isNaN(value) || !Number.isInteger(value) || value < 0) {
            return Result.fail(ResultError.validation("Confirmation count must be a non-negative integer."));
        }
        return Result.ok(new ConfirmationCount({ value }));
    }
    get value() {
        return this.props.value;
    }
}
