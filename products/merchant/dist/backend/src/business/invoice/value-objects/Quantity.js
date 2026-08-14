import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a positive quantity count.
 */
export class Quantity extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a Quantity.
     */
    static create(value) {
        if (isNaN(value) || value <= 0) {
            return Result.fail(ResultError.validation("Quantity must be a positive number greater than zero."));
        }
        return Result.ok(new Quantity({ value }));
    }
    get value() {
        return this.props.value;
    }
}
