import { Entity } from "../../../foundation/core/Entity.js";
import { Money } from "../../invoice/value-objects/Money.js";
/**
 * Child Entity representing an unapplied credit balance belonging to the customer.
 */
export class CustomerCredit extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get source() { return this.props.source; }
    get amount() { return this.props.amount; }
    get remainingBalance() { return this.props.remainingBalance; }
    get reason() { return this.props.reason; }
    get createdAt() { return this.props.createdAt; }
    /**
     * Consumes credit. Returns the excess amount of request that wasn't covered by this credit.
     */
    consume(amount) {
        if (amount.currency !== this.props.remainingBalance.currency) {
            throw new Error("Currency mismatch in credit consumption.");
        }
        const current = this.props.remainingBalance.amount;
        if (amount.amount >= current) {
            this.props.remainingBalance = Money.create(0, this.props.remainingBalance.currency).value;
            return Money.create(amount.amount - current, amount.currency).value;
        }
        else {
            this.props.remainingBalance = Money.create(current - amount.amount, this.props.remainingBalance.currency).value;
            return Money.create(0, amount.currency).value;
        }
    }
    /**
     * Checks if this credit is fully applied/consumed.
     */
    get isFullyConsumed() {
        return this.props.remainingBalance.amount === 0;
    }
}
