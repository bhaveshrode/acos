import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a tax identifier profile registration (GST/VAT/TIN).
 */
export class TaxIdentifier extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a TaxIdentifier.
     */
    static create(value, type = "VAT") {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Tax identifier value cannot be empty."));
        }
        return Result.ok(new TaxIdentifier({ value: value.trim().toUpperCase(), type }));
    }
    get value() { return this.props.value; }
    get type() { return this.props.type; }
}
