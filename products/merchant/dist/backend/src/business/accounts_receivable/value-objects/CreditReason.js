import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing the business reason why a customer credit was created.
 */
export class CreditReason extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a CreditReason.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Credit reason cannot be empty."));
        }
        return Result.ok(new CreditReason({ value: value.trim() }));
    }
    get value() {
        return this.props.value;
    }
}
