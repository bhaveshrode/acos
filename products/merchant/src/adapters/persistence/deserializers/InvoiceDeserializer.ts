import { InvoiceSnapshot } from "../snapshots/InvoiceSnapshot.js";
import {
  OrganizationId,
  CustomerId,
  InvoiceNumber,
  Money,
  Quantity,
  UnitPrice,
  TaxRate,
  Discount,
  InvoicePeriod,
  DueDate,
  PaymentTerms,
  PaymentTermType,
  InvoiceLine,
  InvoiceNote,
  InvoiceStatus,
  InvoiceType,
  DiscountType,
  UserId,
  UniqueEntityID
} from "acos-backend";

/**
 * Rebuilds the aggregate state from a persisted snapshot.
 */
export class InvoiceDeserializer {
  public static deserialize(snapshot: InvoiceSnapshot) {
    const lines = new Map<string, InvoiceLine>();
    for (const l of snapshot.lines) {
      lines.set(
        l.id,
        new InvoiceLine(new UniqueEntityID(l.id), {
          description: l.description,
          quantity: Quantity.create(l.quantity).value,
          unitPrice: UnitPrice.create(Money.create(l.price, snapshot.currency).value).value,
          taxRate: TaxRate.create(l.taxRate).value
        })
      );
    }

    const notes = new Map<string, InvoiceNote>();
    for (const n of snapshot.notes) {
      notes.set(
        n.id,
        new InvoiceNote(new UniqueEntityID(n.id), {
          content: n.content,
          createdBy: new UserId(n.authorId),
          createdAt: n.createdAt
        })
      );
    }

    return {
      organizationId: new OrganizationId(snapshot.organizationId),
      customerId: new CustomerId(snapshot.customerId),
      invoiceNumber: InvoiceNumber.create(snapshot.invoiceNumber).value,
      status: snapshot.status as InvoiceStatus,
      type: snapshot.type as InvoiceType,
      currency: snapshot.currency,
      paymentTerms: PaymentTerms.create(snapshot.paymentTerms as PaymentTermType).value,
      issueDate: snapshot.issueDate,
      dueDate: DueDate.create(snapshot.dueDate).value,
      sentAt: snapshot.sentAt ?? null,
      lines,
      notes,
      discount: snapshot.discount
        ? Discount.create(snapshot.discount.type as DiscountType, snapshot.discount.value).value
        : null,
      period: snapshot.period
        ? InvoicePeriod.create(snapshot.period.startDate, snapshot.period.endDate).value
        : null,
      subtotal: Money.create(snapshot.subtotal, snapshot.currency).value,
      taxTotal: Money.create(snapshot.taxTotal, snapshot.currency).value,
      discountTotal: Money.create(snapshot.discountTotal, snapshot.currency).value,
      grandTotal: Money.create(snapshot.grandTotal, snapshot.currency).value,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
