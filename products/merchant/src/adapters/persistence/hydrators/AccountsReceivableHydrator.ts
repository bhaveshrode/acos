import {
  AccountsReceivable,
  ReceivableAccountId,
  OrganizationId,
  CustomerId,
  InvoiceId,
  SettlementId,
  UserId,
  UniqueEntityID,
  Money,
  CreditReason,
  ReceivableEntry,
  PaymentApplication,
  CustomerCredit,
  CollectionAction,
  ReceivableStatus,
  CollectionStatus,
  CreditSource
} from "acos-backend";
import { AccountsReceivableSnapshot } from "../snapshots/AccountsReceivableSnapshot.js";

/**
 * Rebuilds the AccountsReceivable aggregate from a persisted snapshot.
 */
export class AccountsReceivableHydrator {
  public static hydrate(snapshot: AccountsReceivableSnapshot): AccountsReceivable {
    const entries = new Map<string, ReceivableEntry>();
    for (const entry of snapshot.entries) {
      entries.set(
        entry.invoiceId,
        new ReceivableEntry(new UniqueEntityID(entry.id), {
          invoiceId: new InvoiceId(entry.invoiceId),
          originalAmount: Money.create(entry.originalAmount, entry.currency).value,
          remainingBalance: Money.create(entry.remainingAmount, entry.currency).value,
          dueDate: entry.dueDate
        })
      );
    }

    const result = AccountsReceivable.create(
      new ReceivableAccountId(snapshot.id),
      new OrganizationId(snapshot.organizationId),
      new CustomerId(snapshot.customerId),
      {
        status: snapshot.status as ReceivableStatus,
        collectionStatus: snapshot.collectionStatus as CollectionStatus,
        entries,
        paymentApplications: snapshot.paymentApplications.map(
          (application) =>
            new PaymentApplication(new UniqueEntityID(application.id), {
              settlementId: new SettlementId(application.settlementId),
              invoiceId: new InvoiceId(application.invoiceId),
              appliedAmount: Money.create(application.amount, application.currency).value,
              appliedAt: application.appliedAt
            })
        ),
        customerCredits: snapshot.customerCredits.map(
          (credit) =>
            new CustomerCredit(new UniqueEntityID(credit.id), {
              source: credit.source as CreditSource,
              amount: Money.create(credit.amount, credit.currency).value,
              remainingBalance: Money.create(credit.remainingAmount, credit.currency).value,
              reason: CreditReason.create(credit.reason).value,
              createdAt: credit.createdAt
            })
        ),
        collectionActions: snapshot.collectionActions.map(
          (action) =>
            new CollectionAction(new UniqueEntityID(action.id), {
              actionType: action.actionType,
              notes: action.notes,
              performedBy: new UserId(action.performedBy),
              timestamp: action.timestamp
            })
        ),
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt
      }
    );

    if (result.isFailure) {
      throw new Error(`Failed to hydrate accounts receivable ${snapshot.id}: ${result.error.message}`);
    }

    return result.value;
  }
}
