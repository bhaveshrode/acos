import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a tax rate percentage (0 to 100).
 */
export class TaxRate extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a TaxRate.
     */
    static create(value) {
        if (isNaN(value) || value < 0 || value > 100) {
            return Result.fail(ResultError.validation("Tax rate must be a percentage between 0 and 100."));
        }
        return Result.ok(new TaxRate({ value }));
    }
    get value() {
        return this.props.value;
    }
}
