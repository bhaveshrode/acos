import { Invoice } from "../../../business/invoice/aggregates/Invoice.js";
import { InvoiceSnapshot } from "../snapshots/InvoiceSnapshot.js";

/**
 * Serializes Invoice aggregate root into InvoiceSnapshot models.
 */
export class InvoiceSerializer {
  public static serialize(aggregate: Invoice): InvoiceSnapshot {
    return {
      id: aggregate.id.value,
      organizationId: aggregate.organizationId.value,
      customerId: aggregate.customerId.value,
      invoiceNumber: aggregate.invoiceNumber.value,
      status: aggregate.status,
      type: aggregate.type,
      currency: aggregate.currency,
      paymentTerms: aggregate.paymentTerms.value,
      issueDate: aggregate.issueDate,
      dueDate: aggregate.dueDate.value,
      lines: aggregate.lines.map((l) => ({
        id: l.id.value,
        description: l.description,
        quantity: l.quantity.value,
        price: l.unitPrice.amount,
        taxRate: l.taxRate.value,
        amount: l.total.amount
      })),
      notes: aggregate.notes.map((n) => ({
        id: n.id.value,
        content: n.content,
        authorId: n.createdBy.value,
        createdAt: n.createdAt
      })),
      discount: aggregate.discount
        ? {
            type: aggregate.discount.type,
            value: aggregate.discount.value
          }
        : null,
      period: aggregate.period
        ? {
            startDate: aggregate.period.startDate,
            endDate: aggregate.period.endDate
          }
        : null,
      subtotal: aggregate.subtotal.amount,
      taxTotal: aggregate.taxTotal.amount,
      discountTotal: aggregate.discountTotal.amount,
      grandTotal: aggregate.grandTotal.amount,
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
