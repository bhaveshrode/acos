import { Entity } from "../../../foundation/core/Entity.js";
import { Money } from "../../invoice/value-objects/Money.js";
/**
 * Child Entity representing an individual invoice obligation and its unpaid balance.
 */
export class ReceivableEntry extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get invoiceId() { return this.props.invoiceId; }
    get originalAmount() { return this.props.originalAmount; }
    get remainingBalance() { return this.props.remainingBalance; }
    get dueDate() { return this.props.dueDate; }
    /**
     * Applies a payment or credit to reduce the remaining balance.
     * Returns any excess amount that was not absorbed.
     */
    applyPayment(amount) {
        if (amount.currency !== this.props.remainingBalance.currency) {
            throw new Error("Currency mismatch in payment application.");
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
     * Forgives or writes off a remaining balance.
     */
    writeOff(amount) {
        if (amount.currency !== this.props.remainingBalance.currency) {
            throw new Error("Currency mismatch in write-off.");
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
     * Checks if this entry is fully paid.
     */
    get isPaid() {
        return this.props.remainingBalance.amount === 0;
    }
}
