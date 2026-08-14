import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a validated international telephone number.
 */
export class PhoneNumber extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PhoneNumber.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Phone number cannot be empty."));
        }
        const trimmed = value.trim();
        const pattern = /^\+?[0-9\s\-()]{7,20}$/;
        if (!pattern.test(trimmed)) {
            return Result.fail(ResultError.validation(`Invalid phone number structure: '${value}'`));
        }
        return Result.ok(new PhoneNumber({ value: trimmed }));
    }
    get value() {
        return this.props.value;
    }
}
