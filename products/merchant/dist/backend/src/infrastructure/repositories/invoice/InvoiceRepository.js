"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceRepository = void 0;
const BaseRepository_js_1 = require("../base/BaseRepository.js");
const Result_js_1 = require("../../../foundation/result/Result.js");
const ResultError_js_1 = require("../../../foundation/result/ResultError.js");
const InvoiceExtractor_js_1 = require("../../persistence/extractors/InvoiceExtractor.js");
const InvoiceHydrator_js_1 = require("../../persistence/hydrators/InvoiceHydrator.js");
/**
 * Concrete infrastructure repository implementing Invoice persistence operations.
 */
class InvoiceRepository extends BaseRepository_js_1.BaseRepository {
    async findById(id) {
        try {
            const invoiceRow = await this.prisma.invoice.findUnique({
                where: { id: id.value }
            });
            if (!invoiceRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Invoice with ID ${id.value} not found.`));
            }
            const lines = await this.prisma.invoiceLineItem.findMany({
                where: { invoiceId: id.value }
            });
            const notes = await this.prisma.invoiceNote.findMany({
                where: { invoiceId: id.value }
            });
            const snapshot = {
                id: invoiceRow.id,
                organizationId: invoiceRow.organizationId,
                customerId: invoiceRow.customerId,
                invoiceNumber: invoiceRow.invoiceNumber,
                status: invoiceRow.status,
                type: invoiceRow.type,
                currency: invoiceRow.currency,
                paymentTerms: invoiceRow.paymentTerms,
                issueDate: invoiceRow.issueDate,
                dueDate: invoiceRow.dueDate,
                discount: invoiceRow.discountType
                    ? { type: invoiceRow.discountType, value: invoiceRow.discountValue }
                    : null,
                period: invoiceRow.periodStartDate
                    ? { startDate: invoiceRow.periodStartDate, endDate: invoiceRow.periodEndDate }
                    : null,
                subtotal: invoiceRow.subtotal,
                taxTotal: invoiceRow.taxTotal,
                discountTotal: invoiceRow.discountTotal,
                grandTotal: invoiceRow.grandTotal,
                lines: lines.map((l) => ({
                    id: l.id,
                    description: l.description,
                    quantity: l.quantity,
                    price: l.price,
                    taxRate: l.taxRate,
                    amount: l.amount
                })),
                notes: notes.map((n) => ({
                    id: n.id,
                    content: n.content,
                    authorId: n.authorId,
                    createdAt: n.createdAt
                })),
                createdAt: invoiceRow.createdAt,
                updatedAt: invoiceRow.updatedAt
            };
            const aggregate = InvoiceHydrator_js_1.InvoiceHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByInvoiceNumber(orgId, number) {
        try {
            const invoiceRow = await this.prisma.invoice.findFirst({
                where: {
                    organizationId: orgId.value,
                    invoiceNumber: number.value
                }
            });
            if (!invoiceRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Invoice with number ${number.value} under organization ${orgId.value} not found.`));
            }
            const idVal = invoiceRow.id;
            const lines = await this.prisma.invoiceLineItem.findMany({ where: { invoiceId: idVal } });
            const notes = await this.prisma.invoiceNote.findMany({ where: { invoiceId: idVal } });
            const snapshot = {
                id: invoiceRow.id,
                organizationId: invoiceRow.organizationId,
                customerId: invoiceRow.customerId,
                invoiceNumber: invoiceRow.invoiceNumber,
                status: invoiceRow.status,
                type: invoiceRow.type,
                currency: invoiceRow.currency,
                paymentTerms: invoiceRow.paymentTerms,
                issueDate: invoiceRow.issueDate,
                dueDate: invoiceRow.dueDate,
                discount: invoiceRow.discountType
                    ? { type: invoiceRow.discountType, value: invoiceRow.discountValue }
                    : null,
                period: invoiceRow.periodStartDate
                    ? { startDate: invoiceRow.periodStartDate, endDate: invoiceRow.periodEndDate }
                    : null,
                subtotal: invoiceRow.subtotal,
                taxTotal: invoiceRow.taxTotal,
                discountTotal: invoiceRow.discountTotal,
                grandTotal: invoiceRow.grandTotal,
                lines: lines.map((l) => ({
                    id: l.id,
                    description: l.description,
                    quantity: l.quantity,
                    price: l.price,
                    taxRate: l.taxRate,
                    amount: l.amount
                })),
                notes: notes.map((n) => ({
                    id: n.id,
                    content: n.content,
                    authorId: n.authorId,
                    createdAt: n.createdAt
                })),
                createdAt: invoiceRow.createdAt,
                updatedAt: invoiceRow.updatedAt
            };
            const aggregate = InvoiceHydrator_js_1.InvoiceHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByCustomer(orgId, customerId) {
        try {
            const invoiceRows = await this.prisma.invoice.findMany({
                where: {
                    organizationId: orgId.value,
                    customerId: customerId.value
                }
            });
            const aggregates = [];
            for (const row of invoiceRows) {
                const lines = await this.prisma.invoiceLineItem.findMany({ where: { invoiceId: row.id } });
                const notes = await this.prisma.invoiceNote.findMany({ where: { invoiceId: row.id } });
                const snapshot = {
                    id: row.id,
                    organizationId: row.organizationId,
                    customerId: row.customerId,
                    invoiceNumber: row.invoiceNumber,
                    status: row.status,
                    type: row.type,
                    currency: row.currency,
                    paymentTerms: row.paymentTerms,
                    issueDate: row.issueDate,
                    dueDate: row.dueDate,
                    discount: row.discountType ? { type: row.discountType, value: row.discountValue } : null,
                    period: row.periodStartDate ? { startDate: row.periodStartDate, endDate: row.periodEndDate } : null,
                    subtotal: row.subtotal,
                    taxTotal: row.taxTotal,
                    discountTotal: row.discountTotal,
                    grandTotal: row.grandTotal,
                    lines: lines.map((l) => ({
                        id: l.id,
                        description: l.description,
                        quantity: l.quantity,
                        price: l.price,
                        taxRate: l.taxRate,
                        amount: l.amount
                    })),
                    notes: notes.map((n) => ({
                        id: n.id,
                        content: n.content,
                        authorId: n.authorId,
                        createdAt: n.createdAt
                    })),
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                };
                aggregates.push(InvoiceHydrator_js_1.InvoiceHydrator.hydrate(snapshot));
            }
            return Result_js_1.Result.ok(aggregates);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByOrganization(orgId) {
        try {
            const invoiceRows = await this.prisma.invoice.findMany({
                where: { organizationId: orgId.value }
            });
            const aggregates = [];
            for (const row of invoiceRows) {
                const lines = await this.prisma.invoiceLineItem.findMany({ where: { invoiceId: row.id } });
                const notes = await this.prisma.invoiceNote.findMany({ where: { invoiceId: row.id } });
                const snapshot = {
                    id: row.id,
                    organizationId: row.organizationId,
                    customerId: row.customerId,
                    invoiceNumber: row.invoiceNumber,
                    status: row.status,
                    type: row.type,
                    currency: row.currency,
                    paymentTerms: row.paymentTerms,
                    issueDate: row.issueDate,
                    dueDate: row.dueDate,
                    discount: row.discountType ? { type: row.discountType, value: row.discountValue } : null,
                    period: row.periodStartDate ? { startDate: row.periodStartDate, endDate: row.periodEndDate } : null,
                    subtotal: row.subtotal,
                    taxTotal: row.taxTotal,
                    discountTotal: row.discountTotal,
                    grandTotal: row.grandTotal,
                    lines: lines.map((l) => ({
                        id: l.id,
                        description: l.description,
                        quantity: l.quantity,
                        price: l.price,
                        taxRate: l.taxRate,
                        amount: l.amount
                    })),
                    notes: notes.map((n) => ({
                        id: n.id,
                        content: n.content,
                        authorId: n.authorId,
                        createdAt: n.createdAt
                    })),
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                };
                aggregates.push(InvoiceHydrator_js_1.InvoiceHydrator.hydrate(snapshot));
            }
            return Result_js_1.Result.ok(aggregates);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async exists(orgId, number) {
        try {
            const count = await this.prisma.invoice.count({
                where: {
                    organizationId: orgId.value,
                    invoiceNumber: number.value
                }
            });
            return Result_js_1.Result.ok(count > 0);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async save(invoice) {
        try {
            const { invoice: invoiceRow, lines, notes } = InvoiceExtractor_js_1.InvoiceExtractor.extract(invoice);
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
                await txPrisma.invoice.upsert({
                    where: { id: invoiceRow.id },
                    create: invoiceRow,
                    update: invoiceRow
                });
                // Sync lines
                await txPrisma.invoiceLineItem.deleteMany({ where: { invoiceId: invoiceRow.id } });
                if (lines.length > 0) {
                    await txPrisma.invoiceLineItem.createMany({ data: lines });
                }
                // Sync notes
                await txPrisma.invoiceNote.deleteMany({ where: { invoiceId: invoiceRow.id } });
                if (notes.length > 0) {
                    await txPrisma.invoiceNote.createMany({ data: notes });
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
                await txPrisma.invoiceLineItem.deleteMany({ where: { invoiceId: id.value } });
                await txPrisma.invoiceNote.deleteMany({ where: { invoiceId: id.value } });
                await txPrisma.invoice.delete({ where: { id: id.value } });
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
}
exports.InvoiceRepository = InvoiceRepository;
