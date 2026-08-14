import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing the application of settled funds to a specific invoice.
 */
export class PaymentApplication extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get settlementId() { return this.props.settlementId; }
    get invoiceId() { return this.props.invoiceId; }
    get appliedAmount() { return this.props.appliedAmount; }
    get appliedAt() { return this.props.appliedAt; }
}
