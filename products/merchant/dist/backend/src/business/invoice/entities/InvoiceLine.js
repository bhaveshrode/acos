import { Entity } from "../../../foundation/core/Entity.js";
import { Money } from "../value-objects/Money.js";
/**
 * Child Entity representing an itemized billable item on an invoice.
 */
export class InvoiceLine extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get description() { return this.props.description; }
    get quantity() { return this.props.quantity; }
    get unitPrice() { return this.props.unitPrice; }
    get taxRate() { return this.props.taxRate; }
    /**
     * Calculates subtotal before taxes (Quantity * UnitPrice).
     */
    get subtotal() {
        const rawAmount = this.quantity.value * this.unitPrice.amount;
        return Money.create(rawAmount, this.unitPrice.currency).value;
    }
    /**
     * Calculates tax amount applied to this line (subtotal * taxRate / 100).
     */
    get taxAmount() {
        const rawTax = this.subtotal.amount * (this.taxRate.value / 100);
        return Money.create(rawTax, this.unitPrice.currency).value;
    }
    /**
     * Calculates line total (subtotal + taxAmount).
     */
    get total() {
        return this.subtotal.add(this.taxAmount).value;
    }
    /**
     * Replaces details.
     */
    updateLine(description, quantity, unitPrice, taxRate) {
        this.props.description = description;
        this.props.quantity = quantity;
        this.props.unitPrice = unitPrice;
        this.props.taxRate = taxRate;
    }
}
