import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a non-negative price per unit.
 */
export class UnitPrice extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a UnitPrice.
     */
    static create(price) {
        if (price.amount < 0) {
            return Result.fail(ResultError.validation("Unit price cannot be negative."));
        }
        return Result.ok(new UnitPrice({ price }));
    }
    get price() {
        return this.props.price;
    }
    get amount() { return this.props.price.amount; }
    get currency() { return this.props.price.currency; }
}
