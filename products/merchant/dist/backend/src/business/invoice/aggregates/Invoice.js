import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "../value-objects/Money.js";
// Child Entities
import { InvoiceLine } from "../entities/InvoiceLine.js";
import { InvoiceNote } from "../entities/InvoiceNote.js";
// Enums
import { InvoiceStatus } from "../enums/InvoiceStatus.js";
import { InvoiceType } from "../enums/InvoiceType.js";
import { DiscountType } from "../enums/DiscountType.js";
// Domain Events
import { InvoiceCreated } from "../events/InvoiceCreated.js";
import { InvoiceIssued } from "../events/InvoiceIssued.js";
import { InvoiceUpdated } from "../events/InvoiceUpdated.js";
import { InvoiceVoided } from "../events/InvoiceVoided.js";
import { InvoiceCancelled } from "../events/InvoiceCancelled.js";
import { InvoiceDueDateChanged } from "../events/InvoiceDueDateChanged.js";
import { InvoicePartiallyPaid } from "../events/InvoicePartiallyPaid.js";
import { InvoicePaid } from "../events/InvoicePaid.js";
import { InvoiceOverpaid } from "../events/InvoiceOverpaid.js";
import { InvoiceClosed } from "../events/InvoiceClosed.js";
/**
 * Aggregate Root guarding Invoice billing lines, totals math, issue deadlines, and states.
 */
export class Invoice extends AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    /**
     * Factory constructor to create a new Invoice in DRAFT status.
     */
    static create(id, organizationId, customerId, invoiceNumber, currency, paymentTerms, issueDate, dueDate, optional) {
        if (dueDate.value < issueDate) {
            return Result.fail(ResultError.validation("Due date cannot precede the issue date."));
        }
        const cleanCurrency = currency.trim().toUpperCase();
        if (cleanCurrency.length < 3 || cleanCurrency.length > 6) {
            return Result.fail(ResultError.validation("Currency must be a 3- to 6-letter ticker code."));
        }
        const invoice = new Invoice(id, {
            organizationId,
            customerId,
            invoiceNumber,
            status: InvoiceStatus.DRAFT,
            type: optional?.type || InvoiceType.STANDARD,
            currency: cleanCurrency,
            paymentTerms,
            issueDate,
            dueDate,
            lines: new Map(),
            notes: new Map(),
            discount: optional?.discount || null,
            period: optional?.period || null,
            subtotal: Money.zero(cleanCurrency),
            taxTotal: Money.zero(cleanCurrency),
            discountTotal: Money.zero(cleanCurrency),
            grandTotal: Money.zero(cleanCurrency),
            createdAt: optional?.createdAt || new Date(),
            updatedAt: optional?.updatedAt || new Date()
        });
        invoice.recalculateTotals();
        invoice.addDomainEvent(new InvoiceCreated(id.value, organizationId, customerId, invoiceNumber));
        return Result.ok(invoice);
    }
    // Getters
    get organizationId() { return this.props.organizationId; }
    get customerId() { return this.props.customerId; }
    get invoiceNumber() { return this.props.invoiceNumber; }
    get status() { return this.props.status; }
    get type() { return this.props.type; }
    get currency() { return this.props.currency; }
    get paymentTerms() { return this.props.paymentTerms; }
    get issueDate() { return this.props.issueDate; }
    get dueDate() { return this.props.dueDate; }
    get lines() { return Object.freeze(Array.from(this.props.lines.values())); }
    get notes() { return Object.freeze(Array.from(this.props.notes.values())); }
    get discount() { return this.props.discount; }
    get period() { return this.props.period; }
    get subtotal() { return this.props.subtotal; }
    get taxTotal() { return this.props.taxTotal; }
    get discountTotal() { return this.props.discountTotal; }
    get grandTotal() { return this.props.grandTotal; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
    ensureEditable() {
        if (this.status !== InvoiceStatus.DRAFT) {
            return Result.fail(ResultError.conflict(`Issued invoices are immutable. Current status is ${this.status}.`));
        }
        return Result.ok();
    }
    recalculateTotals() {
        let subtotalAmount = 0;
        let taxAmount = 0;
        this.props.lines.forEach((line) => {
            subtotalAmount += line.subtotal.amount;
            taxAmount += line.taxAmount.amount;
        });
        let discountAmount = 0;
        if (this.props.discount) {
            if (this.props.discount.type === DiscountType.PERCENTAGE) {
                discountAmount = subtotalAmount * (this.props.discount.value / 100);
            }
            else {
                discountAmount = this.props.discount.value;
            }
        }
        subtotalAmount = Math.round(subtotalAmount * 100) / 100;
        taxAmount = Math.round(taxAmount * 100) / 100;
        discountAmount = Math.round(discountAmount * 100) / 100;
        const grandAmount = Math.max(0, Math.round((subtotalAmount + taxAmount - discountAmount) * 100) / 100);
        this.props.subtotal = Money.create(subtotalAmount, this.currency).value;
        this.props.taxTotal = Money.create(taxAmount, this.currency).value;
        this.props.discountTotal = Money.create(discountAmount, this.currency).value;
        this.props.grandTotal = Money.create(grandAmount, this.currency).value;
    }
    /**
     * Appends or updates a billable line item in draft status.
     */
    addLineItem(lineId, description, quantity, unitPrice, taxRate) {
        const editCheck = this.ensureEditable();
        if (editCheck.isFailure)
            return Result.fail(editCheck.error);
        // Enforce matching currency rule
        if (unitPrice.currency !== this.currency) {
            return Result.fail(ResultError.conflict(`Currency mismatch: Line item currency ${unitPrice.currency} does not match Invoice currency ${this.currency}.`));
        }
        const line = new InvoiceLine(lineId, { description, quantity, unitPrice, taxRate });
        this.props.lines.set(lineId.value, line);
        this.recalculateTotals();
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceUpdated(this.id.value));
        return Result.ok();
    }
    /**
     * Removes a billable line item.
     */
    removeLineItem(lineId) {
        const editCheck = this.ensureEditable();
        if (editCheck.isFailure)
            return Result.fail(editCheck.error);
        if (!this.props.lines.has(lineId.value)) {
            return Result.fail(ResultError.notFound("Invoice line item not found."));
        }
        this.props.lines.delete(lineId.value);
        this.recalculateTotals();
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceUpdated(this.id.value));
        return Result.ok();
    }
    /**
     * Replaces the discount attributes of the draft invoice.
     */
    updateDiscount(discount) {
        const editCheck = this.ensureEditable();
        if (editCheck.isFailure)
            return Result.fail(editCheck.error);
        this.props.discount = discount;
        this.recalculateTotals();
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceUpdated(this.id.value));
        return Result.ok();
    }
    /**
     * Finalizes the invoice. Locks all financial fields.
     */
    issue() {
        if (this.status !== InvoiceStatus.DRAFT) {
            return Result.fail(ResultError.conflict("Only draft invoices can be issued."));
        }
        // Invariant: contains at least one line item
        if (this.props.lines.size === 0) {
            return Result.fail(ResultError.conflict("Cannot issue an invoice with zero line items."));
        }
        this.props.status = InvoiceStatus.ISSUED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceIssued(this.id.value));
        return Result.ok();
    }
    /**
     * Records a payment attempt confirmed by the Payment module, updating invoice status.
     */
    recordPayment(amountPaid) {
        if (this.status === InvoiceStatus.DRAFT) {
            return Result.fail(ResultError.conflict("Cannot register payments against draft invoices."));
        }
        if (this.status === InvoiceStatus.VOID || this.status === InvoiceStatus.CANCELLED) {
            return Result.fail(ResultError.conflict("Cannot register payments against voided/cancelled invoices."));
        }
        // Enforce matching currency rule
        if (amountPaid.currency !== this.currency) {
            return Result.fail(ResultError.conflict(`Currency mismatch: Payment currency ${amountPaid.currency} does not match Invoice currency ${this.currency}.`));
        }
        this.props.updatedAt = new Date();
        if (amountPaid.amount >= this.grandTotal.amount) {
            if (amountPaid.amount > this.grandTotal.amount) {
                this.props.status = InvoiceStatus.OVERPAID;
                this.addDomainEvent(new InvoiceOverpaid(this.id.value, amountPaid));
            }
            else {
                this.props.status = InvoiceStatus.PAID;
                this.addDomainEvent(new InvoicePaid(this.id.value, amountPaid));
            }
        }
        else {
            this.props.status = InvoiceStatus.PARTIALLY_PAID;
            this.addDomainEvent(new InvoicePartiallyPaid(this.id.value, amountPaid));
        }
        return Result.ok();
    }
    /**
     * Updates invoice due date, validating range.
     */
    updateDueDate(dueDate) {
        if (this.status === InvoiceStatus.VOID || this.status === InvoiceStatus.CANCELLED || this.status === InvoiceStatus.CLOSED) {
            return Result.fail(ResultError.conflict(`Cannot extend due date for invoices in ${this.status} status.`));
        }
        if (dueDate.value < this.issueDate) {
            return Result.fail(ResultError.validation("Due date cannot precede the issue date."));
        }
        this.props.dueDate = dueDate;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceDueDateChanged(this.id.value, dueDate));
        return Result.ok();
    }
    /**
     * Voids the invoice.
     */
    voidInvoice() {
        if (this.status !== InvoiceStatus.DRAFT && this.status !== InvoiceStatus.ISSUED) {
            return Result.fail(ResultError.conflict(`Cannot void invoice in status ${this.status}.`));
        }
        this.props.status = InvoiceStatus.VOID;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceVoided(this.id.value));
        return Result.ok();
    }
    /**
     * Cancels the invoice.
     */
    cancelInvoice(reason) {
        if (this.status !== InvoiceStatus.DRAFT && this.status !== InvoiceStatus.ISSUED && this.status !== InvoiceStatus.PARTIALLY_PAID) {
            return Result.fail(ResultError.conflict(`Cannot cancel invoice in status ${this.status}.`));
        }
        this.props.status = InvoiceStatus.CANCELLED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceCancelled(this.id.value, reason));
        return Result.ok();
    }
    /**
     * Closes the invoice.
     */
    close() {
        const validCloseStates = [
            InvoiceStatus.PAID,
            InvoiceStatus.OVERPAID,
            InvoiceStatus.VOID,
            InvoiceStatus.CANCELLED
        ];
        if (!validCloseStates.includes(this.status)) {
            return Result.fail(ResultError.conflict(`Cannot close invoice in status ${this.status}.`));
        }
        this.props.status = InvoiceStatus.CLOSED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new InvoiceClosed(this.id.value));
        return Result.ok();
    }
    /**
     * Appends an internal comment line.
     */
    addNote(noteId, content, createdBy) {
        if (!content || content.trim() === "") {
            return Result.fail(ResultError.validation("Note content cannot be empty."));
        }
        const note = new InvoiceNote(noteId, {
            content: content.trim(),
            createdBy,
            createdAt: new Date()
        });
        this.props.notes.set(noteId.value, note);
        this.props.updatedAt = new Date();
        return Result.ok();
    }
}
