import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a billing period date range.
 */
export class InvoicePeriod extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an InvoicePeriod.
     */
    static create(startDate, endDate) {
        if (!startDate || isNaN(startDate.getTime())) {
            return Result.fail(ResultError.validation("Start date must be a valid Date."));
        }
        if (!endDate || isNaN(endDate.getTime())) {
            return Result.fail(ResultError.validation("End date must be a valid Date."));
        }
        if (startDate > endDate) {
            return Result.fail(ResultError.validation("Billing period start date cannot precede end date."));
        }
        return Result.ok(new InvoicePeriod({ startDate, endDate }));
    }
    get startDate() { return this.props.startDate; }
    get endDate() { return this.props.endDate; }
}
