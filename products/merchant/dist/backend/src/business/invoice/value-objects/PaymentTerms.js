import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object managing invoice payment term identifiers and due date offsets.
 */
export class PaymentTerms extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PaymentTerms object.
     */
    static create(value = "DUE_ON_RECEIPT") {
        const validTerms = ["DUE_ON_RECEIPT", "NET_15", "NET_30", "NET_60"];
        if (!validTerms.includes(value)) {
            return Result.fail(ResultError.validation(`Invalid payment terms identifier: '${value}'.`));
        }
        return Result.ok(new PaymentTerms({ value }));
    }
    get value() {
        return this.props.value;
    }
    /**
     * Calculates a concrete DueDate based on the Issue Date.
     */
    calculateDueDate(issueDate) {
        const date = new Date(issueDate.getTime());
        switch (this.value) {
            case "NET_15":
                date.setDate(date.getDate() + 15);
                break;
            case "NET_30":
                date.setDate(date.getDate() + 30);
                break;
            case "NET_60":
                date.setDate(date.getDate() + 60);
                break;
            case "DUE_ON_RECEIPT":
            default:
                break;
        }
        return date;
    }
}
