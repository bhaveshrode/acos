import { InvoiceSerializer } from "../serializers/InvoiceSerializer.js";
/**
 * Extracts distinct database records from the Invoice aggregate graph.
 */
export class InvoiceExtractor {
    static extract(aggregate) {
        const snapshot = InvoiceSerializer.serialize(aggregate);
        const invoiceRecord = {
            id: snapshot.id,
            organizationId: snapshot.organizationId,
            customerId: snapshot.customerId,
            invoiceNumber: snapshot.invoiceNumber,
            status: snapshot.status,
            type: snapshot.type,
            currency: snapshot.currency,
            paymentTerms: snapshot.paymentTerms,
            issueDate: snapshot.issueDate,
            dueDate: snapshot.dueDate,
            discountType: snapshot.discount ? snapshot.discount.type : null,
            discountValue: snapshot.discount ? snapshot.discount.value : null,
            periodStartDate: snapshot.period ? snapshot.period.startDate : null,
            periodEndDate: snapshot.period ? snapshot.period.endDate : null,
            subtotal: snapshot.subtotal,
            taxTotal: snapshot.taxTotal,
            discountTotal: snapshot.discountTotal,
            grandTotal: snapshot.grandTotal,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt
        };
        return {
            invoice: invoiceRecord,
            lines: snapshot.lines.map((l) => ({
                id: l.id,
                invoiceId: snapshot.id,
                description: l.description,
                quantity: l.quantity,
                price: l.price,
                taxRate: l.taxRate,
                amount: l.amount
            })),
            notes: snapshot.notes.map((n) => ({
                id: n.id,
                invoiceId: snapshot.id,
                content: n.content,
                authorId: n.authorId,
                createdAt: n.createdAt
            }))
        };
    }
}
