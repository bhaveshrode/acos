import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a validated commercial payment reference (e.g. PAY-2027-000001).
 */
export class PaymentReference extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PaymentReference.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Payment reference cannot be empty."));
        }
        const trimmed = value.trim().toUpperCase();
        if (!trimmed.startsWith("PAY-")) {
            return Result.fail(ResultError.validation(`Invalid payment reference: '${value}'. Must start with 'PAY-'.`));
        }
        return Result.ok(new PaymentReference({ value: trimmed }));
    }
    get value() {
        return this.props.value;
    }
}
