import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a validated invoice deadline.
 */
export class DueDate extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a DueDate.
     */
    static create(value) {
        if (!value || isNaN(value.getTime())) {
            return Result.fail(ResultError.validation("Due date must be a valid Date object."));
        }
        return Result.ok(new DueDate({ value }));
    }
    get value() {
        return this.props.value;
    }
}
