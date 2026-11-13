import { AccountsReceivable } from "acos-backend";
import { AccountsReceivableSnapshot } from "../snapshots/AccountsReceivableSnapshot.js";

export class AccountsReceivableSerializer {
  public static serialize(ar: AccountsReceivable): AccountsReceivableSnapshot {
    return {
      id: ar.id.value,
      organizationId: ar.organizationId.value,
      customerId: ar.customerId.value,
      status: ar.status,
      collectionStatus: ar.collectionStatus,
      entries: ar.entries.map((entry) => ({
        id: entry.id.value,
        invoiceId: entry.invoiceId.value,
        originalAmount: entry.originalAmount.amount,
        remainingAmount: entry.remainingBalance.amount,
        currency: entry.remainingBalance.currency,
        dueDate: entry.dueDate
      })),
      paymentApplications: ar.paymentApplications.map((application) => ({
        id: application.id.value,
        settlementId: application.settlementId.value,
        invoiceId: application.invoiceId.value,
        amount: application.appliedAmount.amount,
        currency: application.appliedAmount.currency,
        appliedAt: application.appliedAt
      })),
      customerCredits: ar.customerCredits.map((credit) => ({
        id: credit.id.value,
        source: credit.source,
        amount: credit.amount.amount,
        remainingAmount: credit.remainingBalance.amount,
        currency: credit.remainingBalance.currency,
        reason: credit.reason.value,
        createdAt: credit.createdAt
      })),
      collectionActions: ar.collectionActions.map((action) => ({
        id: action.id.value,
        actionType: action.actionType,
        notes: action.notes,
        performedBy: action.performedBy.value,
        timestamp: action.timestamp
      })),
      createdAt: ar.createdAt,
      updatedAt: ar.updatedAt
    };
  }
}
