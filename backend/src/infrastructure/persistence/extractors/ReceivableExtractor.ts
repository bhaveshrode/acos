import { AccountsReceivable } from "../../../business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableSerializer } from "../serializers/ReceivableSerializer.js";

/**
 * Extracts distinct database records from the AccountsReceivable aggregate graph.
 */
export class ReceivableExtractor {
  public static extract(aggregate: AccountsReceivable) {
    const snapshot = ReceivableSerializer.serialize(aggregate);

    const accountRecord = {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      customerId: snapshot.customerId,
      status: snapshot.status,
      collectionStatus: snapshot.collectionStatus,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };

    return {
      account: accountRecord,
      entries: snapshot.entries.map((e) => ({
        id: e.id,
        accountId: snapshot.id,
        invoiceId: e.invoiceId,
        originalAmount: e.originalAmount,
        remainingBalance: e.remainingBalance,
        currency: e.currency,
        dueDate: e.dueDate
      })),
      paymentApplications: snapshot.paymentApplications.map((p) => ({
        id: p.id,
        accountId: snapshot.id,
        settlementId: p.settlementId,
        invoiceId: p.invoiceId,
        appliedAmount: p.appliedAmount,
        currency: p.currency,
        appliedAt: p.appliedAt
      })),
      customerCredits: snapshot.customerCredits.map((c) => ({
        id: c.id,
        accountId: snapshot.id,
        source: c.source,
        amount: c.amount,
        remainingBalance: c.remainingBalance,
        currency: c.currency,
        reason: c.reason,
        createdAt: c.createdAt
      })),
      collectionActions: snapshot.collectionActions.map((ca) => ({
        id: ca.id,
        accountId: snapshot.id,
        actionType: ca.actionType,
        notes: ca.notes,
        performedBy: ca.performedBy,
        timestamp: ca.timestamp
      }))
    };
  }
}
