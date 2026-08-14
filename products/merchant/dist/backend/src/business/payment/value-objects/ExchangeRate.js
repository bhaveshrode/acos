import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a currency exchange conversion multiplier (> 0).
 */
export class ExchangeRate extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an ExchangeRate.
     */
    static create(rate) {
        if (isNaN(rate) || rate <= 0) {
            return Result.fail(ResultError.validation("Exchange rate must be a positive number greater than zero."));
        }
        return Result.ok(new ExchangeRate({ rate }));
    }
    get rate() {
        return this.props.rate;
    }
}
