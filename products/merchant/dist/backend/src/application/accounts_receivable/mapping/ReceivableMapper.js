/**
 * Mapper helper converting AccountsReceivable entities into presentation ReceivableResponseDto models.
 */
export class ReceivableMapper {
    map(source) {
        return {
            id: source.id.value,
            organizationId: source.organizationId.value,
            customerId: source.customerId.value,
            status: source.status,
            collectionStatus: source.collectionStatus,
            entries: source.entries.map((entry) => ({
                invoiceId: entry.invoiceId.value,
                originalAmount: entry.originalAmount.amount,
                remainingBalance: entry.remainingBalance.amount,
                currency: entry.remainingBalance.currency,
                dueDate: entry.dueDate.toISOString(),
                isPaid: entry.isPaid
            })),
            createdAt: source.createdAt.toISOString()
        };
    }
}
