import { ReceivableSnapshot } from "../snapshots/ReceivableSnapshot.js";
import { AccountsReceivableProps } from "../../../business/accounts_receivable/aggregates/AccountsReceivable.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { ReceivableStatus } from "../../../business/accounts_receivable/enums/ReceivableStatus.js";
import { CollectionStatus } from "../../../business/accounts_receivable/enums/CollectionStatus.js";
import { ReceivableEntry } from "../../../business/accounts_receivable/entities/ReceivableEntry.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { PaymentApplication } from "../../../business/accounts_receivable/entities/PaymentApplication.js";
import { SettlementId } from "../../../business/settlement/value-objects/SettlementId.js";
import { CustomerCredit } from "../../../business/accounts_receivable/entities/CustomerCredit.js";
import { CreditSource } from "../../../business/accounts_receivable/enums/CreditSource.js";
import { CreditReason } from "../../../business/accounts_receivable/value-objects/CreditReason.js";
import { CollectionAction } from "../../../business/accounts_receivable/entities/CollectionAction.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs AccountsReceivableProps domain structure from ReceivableSnapshot persistence models.
 */
export class ReceivableDeserializer {
  public static deserialize(snapshot: ReceivableSnapshot): AccountsReceivableProps {
    const entries = new Map<string, ReceivableEntry>();
    for (const e of snapshot.entries) {
      entries.set(
        e.id,
        new ReceivableEntry(new UniqueEntityID(e.id), {
          invoiceId: new InvoiceId(new UniqueEntityID(e.invoiceId)),
          originalAmount: Money.create(e.originalAmount, e.currency).value,
          remainingBalance: Money.create(e.remainingBalance, e.currency).value,
          dueDate: e.dueDate
        })
      );
    }

    const paymentApplications = snapshot.paymentApplications.map(
      (p) =>
        new PaymentApplication(new UniqueEntityID(p.id), {
          settlementId: new SettlementId(new UniqueEntityID(p.settlementId)),
          invoiceId: new InvoiceId(new UniqueEntityID(p.invoiceId)),
          appliedAmount: Money.create(p.appliedAmount, p.currency).value,
          appliedAt: p.appliedAt
        })
    );

    const customerCredits = snapshot.customerCredits.map(
      (c) =>
        new CustomerCredit(new UniqueEntityID(c.id), {
          source: c.source as CreditSource,
          amount: Money.create(c.amount, c.currency).value,
          remainingBalance: Money.create(c.remainingBalance, c.currency).value,
          reason: CreditReason.create(c.reason).value,
          createdAt: c.createdAt
        })
    );

    const collectionActions = snapshot.collectionActions.map(
      (ca) =>
        new CollectionAction(new UniqueEntityID(ca.id), {
          actionType: ca.actionType,
          notes: ca.notes,
          performedBy: new UserId(new UniqueEntityID(ca.performedBy)),
          timestamp: ca.timestamp
        })
    );

    return {
      organizationId: new OrganizationId(new UniqueEntityID(snapshot.organizationId)),
      customerId: new CustomerId(new UniqueEntityID(snapshot.customerId)),
      status: snapshot.status as ReceivableStatus,
      collectionStatus: snapshot.collectionStatus as CollectionStatus,
      entries,
      paymentApplications,
      customerCredits,
      collectionActions,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
