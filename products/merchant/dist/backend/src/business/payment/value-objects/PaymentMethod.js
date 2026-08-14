import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a customer payment method structure.
 */
export class PaymentMethod extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PaymentMethod.
     */
    static create(type, details) {
        if (!details || details.trim() === "") {
            return Result.fail(ResultError.validation("Payment method details cannot be empty."));
        }
        return Result.ok(new PaymentMethod({ type, details: details.trim() }));
    }
    get type() { return this.props.type; }
    get details() { return this.props.details; }
}
