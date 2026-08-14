"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivableSerializer = void 0;
/**
 * Serializes AccountsReceivable aggregate root into ReceivableSnapshot models.
 */
class ReceivableSerializer {
    static serialize(aggregate) {
        return {
            id: aggregate.id.value,
            organizationId: aggregate.organizationId.value,
            customerId: aggregate.customerId.value,
            status: aggregate.status,
            collectionStatus: aggregate.collectionStatus,
            entries: aggregate.entries.map((e) => ({
                id: e.id.value,
                invoiceId: e.invoiceId.value,
                originalAmount: e.originalAmount.amount,
                remainingBalance: e.remainingBalance.amount,
                currency: e.originalAmount.currency,
                dueDate: e.dueDate
            })),
            paymentApplications: aggregate.paymentApplications.map((p) => ({
                id: p.id.value,
                settlementId: p.settlementId.value,
                invoiceId: p.invoiceId.value,
                appliedAmount: p.appliedAmount.amount,
                currency: p.appliedAmount.currency,
                appliedAt: p.appliedAt
            })),
            customerCredits: aggregate.customerCredits.map((c) => ({
                id: c.id.value,
                source: c.source,
                amount: c.amount.amount,
                remainingBalance: c.remainingBalance.amount,
                currency: c.amount.currency,
                reason: c.reason.value,
                createdAt: c.createdAt
            })),
            collectionActions: aggregate.collectionActions.map((ca) => ({
                id: ca.id.value,
                actionType: ca.actionType,
                notes: ca.notes,
                performedBy: ca.performedBy.value,
                timestamp: ca.timestamp
            })),
            createdAt: aggregate.createdAt,
            updatedAt: aggregate.updatedAt
        };
    }
}
exports.ReceivableSerializer = ReceivableSerializer;
