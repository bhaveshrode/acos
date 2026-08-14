/**
 * Mapper helper converting Invoice aggregate entities into presentation InvoiceResponseDto models.
 */
export class InvoiceMapper {
    map(source) {
        return {
            id: source.id.value,
            organizationId: source.organizationId.value,
            customerId: source.customerId.value,
            invoiceNumber: source.invoiceNumber.value,
            status: source.status,
            type: source.type,
            currency: source.currency,
            paymentTerms: source.paymentTerms.value,
            issueDate: source.issueDate.toISOString(),
            dueDate: source.dueDate.value.toISOString(),
            subtotal: source.subtotal.amount,
            taxTotal: source.taxTotal.amount,
            discountTotal: source.discountTotal.amount,
            grandTotal: source.grandTotal.amount,
            lines: source.lines.map((line) => ({
                id: line.id.value,
                description: line.description,
                quantity: line.quantity.value,
                unitPrice: line.unitPrice.amount,
                taxRate: line.taxRate.value,
                taxAmount: line.taxAmount.amount,
                subtotal: line.subtotal.amount,
                total: line.total.amount
            })),
            createdAt: source.createdAt.toISOString()
        };
    }
}
