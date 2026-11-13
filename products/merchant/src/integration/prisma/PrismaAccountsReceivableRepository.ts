import { PrismaClient } from "@prisma/client";
import {
  Result,
  ResultError,
  IAccountsReceivableRepository,
  AccountsReceivable,
  ReceivableAccountId,
  OrganizationId as OrgId,
  CustomerId,
  InvoiceId as InvId
} from "acos-backend";
import { AccountsReceivableSnapshot } from "../../adapters/persistence/snapshots/AccountsReceivableSnapshot.js";
import { AccountsReceivableSerializer } from "../../adapters/persistence/serializers/AccountsReceivableSerializer.js";
import { AccountsReceivableHydrator } from "../../adapters/persistence/hydrators/AccountsReceivableHydrator.js";
import { TransactionScope } from "../../adapters/transactions/scopes/TransactionScope.js";

const CHILDREN = {
  entries: true,
  credits: true,
  paymentApplications: true,
  collectionActions: true
} as const;

export class PrismaAccountsReceivableRepository implements IAccountsReceivableRepository {
  constructor(private prisma: PrismaClient) {}

  /** Joins the ambient unit of work when the boundary opened one. */
  private get db(): any {
    return TransactionScope.current ?? this.prisma;
  }

  public async findById(id: ReceivableAccountId): Promise<Result<AccountsReceivable>> {
    try {
      const row = await this.db.receivableAccount.findUnique({
        where: { id: id.value },
        include: CHILDREN
      });
      if (!row) return Result.fail(ResultError.notFound(`Receivable account ${id.value} not found.`));
      return Result.ok(AccountsReceivableHydrator.hydrate(this.toSnapshot(row)));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByCustomer(orgId: OrgId, customerId: CustomerId): Promise<Result<AccountsReceivable>> {
    try {
      const row = await this.db.receivableAccount.findUnique({
        where: {
          organizationId_customerId: {
            organizationId: orgId.value,
            customerId: customerId.value
          }
        },
        include: CHILDREN
      });
      if (!row) return Result.fail(ResultError.notFound("Receivable account not found."));
      return Result.ok(AccountsReceivableHydrator.hydrate(this.toSnapshot(row)));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByInvoice(orgId: OrgId, invoiceId: InvId): Promise<Result<AccountsReceivable>> {
    try {
      const entry = await this.db.receivableEntry.findFirst({
        where: {
          invoiceId: invoiceId.value,
          account: { is: { organizationId: orgId.value } }
        }
      });
      if (!entry) return Result.fail(ResultError.notFound("Receivable not found."));
      return this.findById(new ReceivableAccountId(entry.accountId));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async save(ar: AccountsReceivable): Promise<Result<void>> {
    try {
      const snapshot = AccountsReceivableSerializer.serialize(ar);

      await this.db.receivableAccount.upsert({
        where: { id: snapshot.id },
        create: {
          id: snapshot.id,
          organizationId: snapshot.organizationId,
          customerId: snapshot.customerId,
          status: snapshot.status,
          collectionStatus: snapshot.collectionStatus,
          createdAt: snapshot.createdAt,
          updatedAt: snapshot.updatedAt
        },
        update: {
          organizationId: snapshot.organizationId,
          customerId: snapshot.customerId,
          status: snapshot.status,
          collectionStatus: snapshot.collectionStatus,
          updatedAt: snapshot.updatedAt
        }
      });

      // The aggregate is the unit of consistency, so its children are rewritten
      // wholesale; a partial diff would leave orphans when an entry is removed.
      await this.db.receivableEntry.deleteMany({ where: { accountId: snapshot.id } });
      await this.db.receivableCredit.deleteMany({ where: { accountId: snapshot.id } });
      await this.db.receivablePaymentApplication.deleteMany({ where: { accountId: snapshot.id } });
      await this.db.receivableCollectionAction.deleteMany({ where: { accountId: snapshot.id } });

      if (snapshot.entries.length > 0) {
        await this.db.receivableEntry.createMany({
          data: snapshot.entries.map((entry) => ({ ...entry, accountId: snapshot.id }))
        });
      }
      if (snapshot.customerCredits.length > 0) {
        await this.db.receivableCredit.createMany({
          data: snapshot.customerCredits.map((credit) => ({ ...credit, accountId: snapshot.id }))
        });
      }
      if (snapshot.paymentApplications.length > 0) {
        await this.db.receivablePaymentApplication.createMany({
          data: snapshot.paymentApplications.map((application) => ({ ...application, accountId: snapshot.id }))
        });
      }
      if (snapshot.collectionActions.length > 0) {
        await this.db.receivableCollectionAction.createMany({
          data: snapshot.collectionActions.map((action) => ({ ...action, accountId: snapshot.id }))
        });
      }

      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: ReceivableAccountId): Promise<Result<void>> {
    try {
      await this.db.receivableAccount.delete({ where: { id: id.value } });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  private toSnapshot(row: any): AccountsReceivableSnapshot {
    return {
      id: row.id,
      organizationId: row.organizationId,
      customerId: row.customerId,
      status: row.status,
      collectionStatus: row.collectionStatus,
      entries: row.entries.map((entry: any) => ({
        id: entry.id,
        invoiceId: entry.invoiceId,
        originalAmount: entry.originalAmount.toNumber(),
        remainingAmount: entry.remainingAmount.toNumber(),
        currency: entry.currency,
        dueDate: entry.dueDate
      })),
      paymentApplications: row.paymentApplications.map((application: any) => ({
        id: application.id,
        settlementId: application.settlementId,
        invoiceId: application.invoiceId,
        amount: application.amount.toNumber(),
        currency: application.currency,
        appliedAt: application.appliedAt
      })),
      customerCredits: row.credits.map((credit: any) => ({
        id: credit.id,
        source: credit.source,
        amount: credit.amount.toNumber(),
        remainingAmount: credit.remainingAmount.toNumber(),
        currency: credit.currency,
        reason: credit.reason,
        createdAt: credit.createdAt
      })),
      collectionActions: row.collectionActions.map((action: any) => ({
        id: action.id,
        actionType: action.actionType,
        notes: action.notes,
        performedBy: action.performedBy,
        timestamp: action.timestamp
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
