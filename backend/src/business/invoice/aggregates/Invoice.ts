import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Value Objects
import { InvoiceId } from "../value-objects/InvoiceId.js";
import { InvoiceNumber } from "../value-objects/InvoiceNumber.js";
import { Money } from "../value-objects/Money.js";
import { Quantity } from "../value-objects/Quantity.js";
import { UnitPrice } from "../value-objects/UnitPrice.js";
import { TaxRate } from "../value-objects/TaxRate.js";
import { Discount } from "../value-objects/Discount.js";
import { DueDate } from "../value-objects/DueDate.js";
import { InvoicePeriod } from "../value-objects/InvoicePeriod.js";
import { PaymentTerms } from "../value-objects/PaymentTerms.js";

// Child Entities
import { InvoiceLine } from "../entities/InvoiceLine.js";
import { InvoiceNote } from "../entities/InvoiceNote.js";

// Enums
import { InvoiceStatus } from "../enums/InvoiceStatus.js";
import { InvoiceType } from "../enums/InvoiceType.js";
import { DiscountType } from "../enums/DiscountType.js";

// Organization / Customer references
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

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

export interface InvoiceProps {
  organizationId: OrganizationId;
  customerId: CustomerId;
  invoiceNumber: InvoiceNumber;
  status: InvoiceStatus;
  type: InvoiceType;
  currency: string;
  paymentTerms: PaymentTerms;
  issueDate: Date;
  dueDate: DueDate;
  lines: Map<string, InvoiceLine>;
  notes: Map<string, InvoiceNote>;
  discount: Discount | null;
  period: InvoicePeriod | null;
  subtotal: Money;
  taxTotal: Money;
  discountTotal: Money;
  grandTotal: Money;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root guarding Invoice billing lines, totals math, issue deadlines, and states.
 */
export class Invoice extends AggregateRoot<InvoiceId> {
  private readonly props: InvoiceProps;

  private constructor(id: InvoiceId, props: InvoiceProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory constructor to create a new Invoice in DRAFT status.
   */
  public static create(
    id: InvoiceId,
    organizationId: OrganizationId,
    customerId: CustomerId,
    invoiceNumber: InvoiceNumber,
    currency: string,
    paymentTerms: PaymentTerms,
    issueDate: Date,
    dueDate: DueDate,
    optional?: {
      type?: InvoiceType;
      discount?: Discount;
      period?: InvoicePeriod;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<Invoice> {
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
  public get organizationId(): OrganizationId { return this.props.organizationId; }
  public get customerId(): CustomerId { return this.props.customerId; }
  public get invoiceNumber(): InvoiceNumber { return this.props.invoiceNumber; }
  public get status(): InvoiceStatus { return this.props.status; }
  public get type(): InvoiceType { return this.props.type; }
  public get currency(): string { return this.props.currency; }
  public get paymentTerms(): PaymentTerms { return this.props.paymentTerms; }
  public get issueDate(): Date { return this.props.issueDate; }
  public get dueDate(): DueDate { return this.props.dueDate; }
  public get lines(): readonly InvoiceLine[] { return Object.freeze(Array.from(this.props.lines.values())); }
  public get notes(): readonly InvoiceNote[] { return Object.freeze(Array.from(this.props.notes.values())); }
  public get discount(): Discount | null { return this.props.discount; }
  public get period(): InvoicePeriod | null { return this.props.period; }
  public get subtotal(): Money { return this.props.subtotal; }
  public get taxTotal(): Money { return this.props.taxTotal; }
  public get discountTotal(): Money { return this.props.discountTotal; }
  public get grandTotal(): Money { return this.props.grandTotal; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  private ensureEditable(): Result<void> {
    if (this.status !== InvoiceStatus.DRAFT) {
      return Result.fail(
        ResultError.conflict(`Issued invoices are immutable. Current status is ${this.status}.`)
      );
    }
    return Result.ok();
  }

  private recalculateTotals(): void {
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
      } else {
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
  public addLineItem(
    lineId: UniqueEntityID,
    description: string,
    quantity: Quantity,
    unitPrice: UnitPrice,
    taxRate: TaxRate
  ): Result<void> {
    const editCheck = this.ensureEditable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    // Enforce matching currency rule
    if (unitPrice.currency !== this.currency) {
      return Result.fail(
        ResultError.conflict(
          `Currency mismatch: Line item currency ${unitPrice.currency} does not match Invoice currency ${this.currency}.`
        )
      );
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
  public removeLineItem(lineId: UniqueEntityID): Result<void> {
    const editCheck = this.ensureEditable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

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
  public updateDiscount(discount: Discount | null): Result<void> {
    const editCheck = this.ensureEditable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    this.props.discount = discount;

    this.recalculateTotals();
    this.props.updatedAt = new Date();
    this.addDomainEvent(new InvoiceUpdated(this.id.value));
    return Result.ok();
  }

  /**
   * Finalizes the invoice. Locks all financial fields.
   */
  public issue(): Result<void> {
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
  public recordPayment(amountPaid: Money): Result<void> {
    if (this.status === InvoiceStatus.DRAFT) {
      return Result.fail(ResultError.conflict("Cannot register payments against draft invoices."));
    }
    if (this.status === InvoiceStatus.VOID || this.status === InvoiceStatus.CANCELLED) {
      return Result.fail(ResultError.conflict("Cannot register payments against voided/cancelled invoices."));
    }

    // Enforce matching currency rule
    if (amountPaid.currency !== this.currency) {
      return Result.fail(
        ResultError.conflict(
          `Currency mismatch: Payment currency ${amountPaid.currency} does not match Invoice currency ${this.currency}.`
        )
      );
    }

    this.props.updatedAt = new Date();

    if (amountPaid.amount >= this.grandTotal.amount) {
      if (amountPaid.amount > this.grandTotal.amount) {
        this.props.status = InvoiceStatus.OVERPAID;
        this.addDomainEvent(new InvoiceOverpaid(this.id.value, amountPaid));
      } else {
        this.props.status = InvoiceStatus.PAID;
        this.addDomainEvent(new InvoicePaid(this.id.value, amountPaid));
      }
    } else {
      this.props.status = InvoiceStatus.PARTIALLY_PAID;
      this.addDomainEvent(new InvoicePartiallyPaid(this.id.value, amountPaid));
    }

    return Result.ok();
  }

  /**
   * Updates invoice due date, validating range.
   */
  public updateDueDate(dueDate: DueDate): Result<void> {
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
  public voidInvoice(): Result<void> {
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
  public cancelInvoice(reason: string): Result<void> {
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
  public close(): Result<void> {
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
  public addNote(noteId: UniqueEntityID, content: string, createdBy: UserId): Result<void> {
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
