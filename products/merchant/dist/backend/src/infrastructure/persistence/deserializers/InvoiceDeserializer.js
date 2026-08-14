import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { InvoiceNumber } from "../../../business/invoice/value-objects/InvoiceNumber.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { Quantity } from "../../../business/invoice/value-objects/Quantity.js";
import { UnitPrice } from "../../../business/invoice/value-objects/UnitPrice.js";
import { TaxRate } from "../../../business/invoice/value-objects/TaxRate.js";
import { Discount } from "../../../business/invoice/value-objects/Discount.js";
import { InvoicePeriod } from "../../../business/invoice/value-objects/InvoicePeriod.js";
import { DueDate } from "../../../business/invoice/value-objects/DueDate.js";
import { PaymentTerms } from "../../../business/invoice/value-objects/PaymentTerms.js";
import { InvoiceLine } from "../../../business/invoice/entities/InvoiceLine.js";
import { InvoiceNote } from "../../../business/invoice/entities/InvoiceNote.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Reconstructs InvoiceProps domain structure from InvoiceSnapshot persistence models.
 */
export class InvoiceDeserializer {
    static deserialize(snapshot) {
        const lines = new Map();
        for (const l of snapshot.lines) {
            lines.set(l.id, new InvoiceLine(new UniqueEntityID(l.id), {
                description: l.description,
                quantity: Quantity.create(l.quantity).value,
                unitPrice: UnitPrice.create(Money.create(l.price, snapshot.currency).value).value,
                taxRate: TaxRate.create(l.taxRate).value
            }));
        }
        const notes = new Map();
        for (const n of snapshot.notes) {
            notes.set(n.id, new InvoiceNote(new UniqueEntityID(n.id), {
                content: n.content,
                createdBy: new UserId(n.authorId),
                createdAt: n.createdAt
            }));
        }
        return {
            organizationId: new OrganizationId(snapshot.organizationId),
            customerId: new CustomerId(snapshot.customerId),
            invoiceNumber: InvoiceNumber.create(snapshot.invoiceNumber).value,
            status: snapshot.status,
            type: snapshot.type,
            currency: snapshot.currency,
            paymentTerms: PaymentTerms.create(snapshot.paymentTerms).value,
            issueDate: snapshot.issueDate,
            dueDate: DueDate.create(snapshot.dueDate).value,
            lines,
            notes,
            discount: snapshot.discount
                ? Discount.create(snapshot.discount.type, snapshot.discount.value).value
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
