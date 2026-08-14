import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a reporting period (e.g. "2027-Q1", "2027-07").
 */
export class ReceivablePeriod extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a ReceivablePeriod.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Receivable period cannot be empty."));
        }
        return Result.ok(new ReceivablePeriod({ value: value.trim() }));
    }
    get value() {
        return this.props.value;
    }
}
