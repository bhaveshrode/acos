import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a customer's legal company name.
 */
export class CompanyName extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a CompanyName.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Company name cannot be empty."));
        }
        const trimmed = value.trim();
        if (trimmed.length > 100) {
            return Result.fail(ResultError.validation("Company name cannot exceed 100 characters."));
        }
        return Result.ok(new CompanyName({ value: trimmed }));
    }
    get value() {
        return this.props.value;
    }
}
