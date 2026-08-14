"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivableRepository = void 0;
const BaseRepository_js_1 = require("../base/BaseRepository.js");
const ReceivableAccountId_js_1 = require("../../../business/accounts_receivable/value-objects/ReceivableAccountId.js");
const Result_js_1 = require("../../../foundation/result/Result.js");
const ResultError_js_1 = require("../../../foundation/result/ResultError.js");
const ReceivableExtractor_js_1 = require("../../persistence/extractors/ReceivableExtractor.js");
const ReceivableHydrator_js_1 = require("../../persistence/hydrators/ReceivableHydrator.js");
/**
 * Concrete infrastructure repository implementing Accounts Receivable persistence operations.
 */
class ReceivableRepository extends BaseRepository_js_1.BaseRepository {
    async findById(id) {
        try {
            const row = await this.prisma.receivableAccount.findUnique({
                where: { id: id.value }
            });
            if (!row) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Receivable account with ID ${id.value} not found.`));
            }
            const entries = await this.prisma.receivableEntry.findMany({
                where: { accountId: id.value }
            });
            const paymentApplications = await this.prisma.paymentApplication.findMany({
                where: { accountId: id.value }
            });
            const customerCredits = await this.prisma.customerCredit.findMany({
                where: { accountId: id.value }
            });
            const collectionActions = await this.prisma.collectionAction.findMany({
                where: { accountId: id.value }
            });
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                customerId: row.customerId,
                status: row.status,
                collectionStatus: row.collectionStatus,
                entries: entries.map((e) => ({
                    id: e.id,
                    invoiceId: e.invoiceId,
                    originalAmount: e.originalAmount,
                    remainingBalance: e.remainingBalance,
                    currency: e.currency,
                    dueDate: e.dueDate
                })),
                paymentApplications: paymentApplications.map((p) => ({
                    id: p.id,
                    settlementId: p.settlementId,
                    invoiceId: p.invoiceId,
                    appliedAmount: p.appliedAmount,
                    currency: p.currency,
                    appliedAt: p.appliedAt
                })),
                customerCredits: customerCredits.map((c) => ({
                    id: c.id,
                    source: c.source,
                    amount: c.amount,
                    remainingBalance: c.remainingBalance,
                    currency: c.currency,
                    reason: c.reason,
                    createdAt: c.createdAt
                })),
                collectionActions: collectionActions.map((ca) => ({
                    id: ca.id,
                    actionType: ca.actionType,
                    notes: ca.notes,
                    performedBy: ca.performedBy,
                    timestamp: ca.timestamp
                })),
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            const aggregate = ReceivableHydrator_js_1.ReceivableHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByCustomer(orgId, custId) {
        try {
            const row = await this.prisma.receivableAccount.findFirst({
                where: {
                    organizationId: orgId.value,
                    customerId: custId.value
                }
            });
            if (!row) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Receivable account for customer ${custId.value} under organization ${orgId.value} not found.`));
            }
            return this.findById(new ReceivableAccountId_js_1.ReceivableAccountId(row.id));
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByInvoice(orgId, invoiceId) {
        try {
            const entry = await this.prisma.receivableEntry.findFirst({
                where: { invoiceId: invoiceId.value }
            });
            if (!entry) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`No receivable account found containing entry for invoice ${invoiceId.value}.`));
            }
            return this.findById(new ReceivableAccountId_js_1.ReceivableAccountId(entry.accountId));
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async save(ar) {
        try {
            const { account: accountRow, entries, paymentApplications, customerCredits, collectionActions } = ReceivableExtractor_js_1.ReceivableExtractor.extract(ar);
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
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
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async delete(id) {
        try {
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
                await txPrisma.receivableEntry.deleteMany({ where: { accountId: id.value } });
                await txPrisma.paymentApplication.deleteMany({ where: { accountId: id.value } });
                await txPrisma.customerCredit.deleteMany({ where: { accountId: id.value } });
                await txPrisma.collectionAction.deleteMany({ where: { accountId: id.value } });
                await txPrisma.receivableAccount.delete({ where: { id: id.value } });
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
}
exports.ReceivableRepository = ReceivableRepository;
