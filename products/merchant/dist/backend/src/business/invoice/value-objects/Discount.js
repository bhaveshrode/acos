import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { DiscountType } from "../enums/DiscountType.js";
/**
 * Value Object representing a fixed or percentage reduction.
 */
export class Discount extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a Discount.
     */
    static create(type, value) {
        if (isNaN(value) || value < 0) {
            return Result.fail(ResultError.validation("Discount value cannot be negative."));
        }
        if (type === DiscountType.PERCENTAGE && value > 100) {
            return Result.fail(ResultError.validation("Percentage discount cannot exceed 100%."));
        }
        return Result.ok(new Discount({ type, value }));
    }
    get type() { return this.props.type; }
    get value() { return this.props.value; }
}
