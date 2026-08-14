import { IAccountsReceivableRepository } from "../../../business/accounts_receivable/repositories/IAccountsReceivableRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { AccountsReceivable } from "../../../business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "../../../business/accounts_receivable/value-objects/ReceivableAccountId.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { ReceivableExtractor } from "../../persistence/extractors/ReceivableExtractor.js";
import { ReceivableHydrator } from "../../persistence/hydrators/ReceivableHydrator.js";

/**
 * Concrete infrastructure repository implementing Accounts Receivable persistence operations.
 */
export class ReceivableRepository extends BaseRepository implements IAccountsReceivableRepository {
  public async findById(id: ReceivableAccountId): Promise<Result<AccountsReceivable>> {
    try {
      const row = await (this.prisma as any).receivableAccount.findUnique({
        where: { id: id.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Receivable account with ID ${id.value} not found.`));
      }

      const entries = await (this.prisma as any).receivableEntry.findMany({
        where: { accountId: id.value }
      });
      const paymentApplications = await (this.prisma as any).paymentApplication.findMany({
        where: { accountId: id.value }
      });
      const customerCredits = await (this.prisma as any).customerCredit.findMany({
        where: { accountId: id.value }
      });
      const collectionActions = await (this.prisma as any).collectionAction.findMany({
        where: { accountId: id.value }
      });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        customerId: row.customerId,
        status: row.status,
        collectionStatus: row.collectionStatus,
        entries: entries.map((e: any) => ({
          id: e.id,
          invoiceId: e.invoiceId,
          originalAmount: e.originalAmount,
          remainingBalance: e.remainingBalance,
          currency: e.currency,
          dueDate: e.dueDate
        })),
        paymentApplications: paymentApplications.map((p: any) => ({
          id: p.id,
          settlementId: p.settlementId,
          invoiceId: p.invoiceId,
          appliedAmount: p.appliedAmount,
          currency: p.currency,
          appliedAt: p.appliedAt
        })),
        customerCredits: customerCredits.map((c: any) => ({
          id: c.id,
          source: c.source,
          amount: c.amount,
          remainingBalance: c.remainingBalance,
          currency: c.currency,
          reason: c.reason,
          createdAt: c.createdAt
        })),
        collectionActions: collectionActions.map((ca: any) => ({
          id: ca.id,
          actionType: ca.actionType,
          notes: ca.notes,
          performedBy: ca.performedBy,
          timestamp: ca.timestamp
        })),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = ReceivableHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByCustomer(orgId: OrganizationId, custId: CustomerId): Promise<Result<AccountsReceivable>> {
    try {
      const row = await (this.prisma as any).receivableAccount.findFirst({
        where: {
          organizationId: orgId.value,
          customerId: custId.value
        }
      });
      if (!row) {
        return Result.fail(
          ResultError.notFound(
            `Receivable account for customer ${custId.value} under organization ${orgId.value} not found.`
          )
        );
      }

      return this.findById(new ReceivableAccountId(row.id));
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<AccountsReceivable>> {
    try {
      const entry = await (this.prisma as any).receivableEntry.findFirst({
        where: { invoiceId: invoiceId.value }
      });
      if (!entry) {
        return Result.fail(
          ResultError.notFound(
            `No receivable account found containing entry for invoice ${invoiceId.value}.`
          )
        );
      }

      return this.findById(new ReceivableAccountId(entry.accountId));
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(ar: AccountsReceivable): Promise<Result<void>> {
    try {
      const {
        account: accountRow,
        entries,
        paymentApplications,
        customerCredits,
        collectionActions
      } = ReceivableExtractor.extract(ar);

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.receivableAccount.upsert({
          where: { id: accountRow.id },
          create: accountRow,
          update: accountRow
        });

        // Sync entries
        await txPrisma.receivableEntry.deleteMany({ where: { accountId: accountRow.id } });
        if (entries.length > 0) {
          await txPrisma.receivableEntry.createMany({ data: entries });
        }

        // Sync payment applications
        await txPrisma.paymentApplication.deleteMany({ where: { accountId: accountRow.id } });
        if (paymentApplications.length > 0) {
          await txPrisma.paymentApplication.createMany({ data: paymentApplications });
        }

        // Sync customer credits
        await txPrisma.customerCredit.deleteMany({ where: { accountId: accountRow.id } });
        if (customerCredits.length > 0) {
          await txPrisma.customerCredit.createMany({ data: customerCredits });
        }

        // Sync collection actions
        await txPrisma.collectionAction.deleteMany({ where: { accountId: accountRow.id } });
        if (collectionActions.length > 0) {
          await txPrisma.collectionAction.createMany({ data: collectionActions });
        }
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: ReceivableAccountId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.receivableEntry.deleteMany({ where: { accountId: id.value } });
        await txPrisma.paymentApplication.deleteMany({ where: { accountId: id.value } });
        await txPrisma.customerCredit.deleteMany({ where: { accountId: id.value } });
        await txPrisma.collectionAction.deleteMany({ where: { accountId: id.value } });
        await txPrisma.receivableAccount.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
