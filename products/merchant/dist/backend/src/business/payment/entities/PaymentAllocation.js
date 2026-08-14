import { Entity } from "../../../foundation/core/Entity.js";
import { AllocationStatus } from "../enums/AllocationStatus.js";
/**
 * Child Entity tracking allocation of payment value to a specific Invoice.
 */
export class PaymentAllocation extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get invoiceId() { return this.props.invoiceId; }
    get allocatedAmount() { return this.props.allocatedAmount; }
    get status() { return this.props.status; }
    /**
     * Sets the status of the allocation to ALLOCATED.
     */
    allocate() {
        this.props.status = AllocationStatus.ALLOCATED;
    }
    /**
     * Releases or voids the allocation.
     */
    release() {
        this.props.status = AllocationStatus.RELEASED;
    }
}
