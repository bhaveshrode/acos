import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a validated URL domain address.
 */
export class Website extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a Website.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Website URL cannot be empty."));
        }
        const trimmed = value.trim();
        const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!pattern.test(trimmed)) {
            return Result.fail(ResultError.validation(`Invalid website URL format: '${value}'`));
        }
        return Result.ok(new Website({ value: trimmed }));
    }
    get value() {
        return this.props.value;
    }
}
