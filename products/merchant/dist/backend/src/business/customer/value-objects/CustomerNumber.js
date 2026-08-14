import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a human-readable customer serial identifier (e.g., CUST-00042).
 */
export class CustomerNumber extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates and validates a CustomerNumber.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Customer number cannot be empty."));
        }
        const trimmed = value.trim().toUpperCase();
        if (!trimmed.startsWith("CUST-")) {
            return Result.fail(ResultError.validation(`Invalid customer number format: '${value}'. Must start with 'CUST-'.`));
        }
        return Result.ok(new CustomerNumber({ value: trimmed }));
    }
    get value() {
        return this.props.value;
    }
}
