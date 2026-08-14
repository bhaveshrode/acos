import { Entity } from "../../../foundation/core/Entity.js";
import { RefundStatus } from "../enums/RefundStatus.js";
/**
 * Child Entity representing a refund request initiated against a payment.
 */
export class RefundRequest extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get amount() { return this.props.amount; }
    get reason() { return this.props.reason; }
    get status() { return this.props.status; }
    get requestedAt() { return this.props.requestedAt; }
    /**
     * Sets status to APPROVED.
     */
    approve() {
        this.props.status = RefundStatus.APPROVED;
    }
    /**
     * Sets status to REJECTED.
     */
    reject() {
        this.props.status = RefundStatus.REJECTED;
    }
    /**
     * Sets status to COMPLETED.
     */
    complete() {
        this.props.status = RefundStatus.COMPLETED;
    }
}
