import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { InvoiceExtractor } from "acos-backend/infrastructure/persistence/extractors/InvoiceExtractor.js";
import { InvoiceHydrator } from "acos-backend/infrastructure/persistence/hydrators/InvoiceHydrator.js";
export class PrismaInvoiceRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        try {
            const row = await this.prisma.invoice.findUnique({
                where: { id: id.value },
                include: { lineItems: true }
            });
            if (!row)
                return Result.fail(ResultError.notFound(`Invoice with ID ${id.value} not found.`));
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                customerId: row.customerId,
                invoiceNumber: row.invoiceNumber,
                status: row.status,
                type: "STANDARD",
                currency: row.currency,
                paymentTerms: "NET_30",
                issueDate: row.issuedAt || new Date(),
                dueDate: row.dueDate || new Date(),
                subtotal: row.totalAmount,
                taxTotal: 0,
                discountTotal: 0,
                grandTotal: row.totalAmount,
                discount: null,
                period: null,
                lines: row.lineItems.map((l) => ({
                    id: l.id,
                    description: l.description,
                    quantity: l.quantity,
                    price: l.price,
                    taxRate: 0,
                    amount: l.amount
                })),
                notes: [],
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            return Result.ok(InvoiceHydrator.hydrate(snapshot));
        }
        catch (err) {
            console.error("[PrismaInvoiceRepository] findById Unexpected error:", err);
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async findByInvoiceNumber(orgId, number) {
        try {
            const row = await this.prisma.invoice.findFirst({
                where: { organizationId: orgId.value, invoiceNumber: number.value },
                include: { lineItems: true }
            });
            if (!row)
                return Result.fail(ResultError.notFound(`Invoice not found.`));
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                customerId: row.customerId,
                invoiceNumber: row.invoiceNumber,
                status: row.status,
                type: "STANDARD",
                currency: row.currency,
                paymentTerms: "NET_30",
                issueDate: row.issuedAt || new Date(),
                dueDate: row.dueDate || new Date(),
                subtotal: row.totalAmount,
                taxTotal: 0,
                discountTotal: 0,
                grandTotal: row.totalAmount,
                discount: null,
                period: null,
                lines: row.lineItems.map((l) => ({
                    id: l.id,
                    description: l.description,
                    quantity: l.quantity,
                    price: l.price,
                    taxRate: 0,
                    amount: l.amount
                })),
                notes: [],
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            return Result.ok(InvoiceHydrator.hydrate(snapshot));
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async findByCustomer(orgId, customerId) {
        try {
            const rows = await this.prisma.invoice.findMany({
                where: { organizationId: orgId.value, customerId: customerId.value },
                include: { lineItems: true }
            });
            const list = rows.map((row) => {
                const snapshot = {
                    id: row.id,
                    organizationId: row.organizationId,
                    customerId: row.customerId,
                    invoiceNumber: row.invoiceNumber,
                    status: row.status,
                    type: "STANDARD",
                    currency: row.currency,
                    paymentTerms: "NET_30",
                    issueDate: row.issuedAt || new Date(),
                    dueDate: row.dueDate || new Date(),
                    subtotal: row.totalAmount,
                    taxTotal: 0,
                    discountTotal: 0,
                    grandTotal: row.totalAmount,
                    discount: null,
                    period: null,
                    lines: row.lineItems.map((l) => ({
                        id: l.id,
                        description: l.description,
                        quantity: l.quantity,
                        price: l.price,
                        taxRate: 0,
                        amount: l.amount
                    })),
                    notes: [],
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                };
                return InvoiceHydrator.hydrate(snapshot);
            });
            return Result.ok(list);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async findByOrganization(orgId) {
        try {
            const rows = await this.prisma.invoice.findMany({
                where: { organizationId: orgId.value },
                include: { lineItems: true }
            });
            const list = rows.map((row) => {
                const snapshot = {
                    id: row.id,
                    organizationId: row.organizationId,
                    customerId: row.customerId,
                    invoiceNumber: row.invoiceNumber,
                    status: row.status,
                    type: "STANDARD",
                    currency: row.currency,
                    paymentTerms: "NET_30",
                    issueDate: row.issuedAt || new Date(),
                    dueDate: row.dueDate || new Date(),
                    subtotal: row.totalAmount,
                    taxTotal: 0,
                    discountTotal: 0,
                    grandTotal: row.totalAmount,
                    discount: null,
                    period: null,
                    lines: row.lineItems.map((l) => ({
                        id: l.id,
                        description: l.description,
                        quantity: l.quantity,
                        price: l.price,
                        taxRate: 0,
                        amount: l.amount
                    })),
                    notes: [],
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                };
                return InvoiceHydrator.hydrate(snapshot);
            });
            return Result.ok(list);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async exists(orgId, number) {
        try {
            const count = await this.prisma.invoice.count({
                where: { organizationId: orgId.value, invoiceNumber: number.value }
            });
            return Result.ok(count > 0);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async save(invoice) {
        try {
            const { invoice: inv, lines } = InvoiceExtractor.extract(invoice);
            await this.prisma.$transaction(async (tx) => {
                await tx.invoice.upsert({
                    where: { id: inv.id },
                    create: {
                        id: inv.id,
                        invoiceNumber: inv.invoiceNumber,
                        customerId: inv.customerId,
                        organizationId: inv.organizationId,
                        status: inv.status,
                        totalAmount: inv.grandTotal,
                        currency: inv.currency,
                        issuedAt: inv.issueDate ? new Date(inv.issueDate) : null,
                        dueDate: inv.dueDate ? new Date(inv.dueDate) : null
                    },
                    update: {
                        customerId: inv.customerId,
                        organizationId: inv.organizationId,
                        status: inv.status,
                        totalAmount: inv.grandTotal,
                        currency: inv.currency,
                        issuedAt: inv.issueDate ? new Date(inv.issueDate) : null,
                        dueDate: inv.dueDate ? new Date(inv.dueDate) : null
                    }
                });
                // Sync lines
                await tx.invoiceLineItem.deleteMany({ where: { invoiceId: inv.id } });
                if (lines.length > 0) {
                    await tx.invoiceLineItem.createMany({
                        data: lines.map((l) => ({
                            id: l.id,
                            invoiceId: inv.id,
                            description: l.description,
                            quantity: l.quantity,
                            price: l.price,
                            amount: l.amount
                        }))
                    });
                }
            });
            return Result.ok();
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async delete(id) {
        try {
            await this.prisma.invoice.delete({ where: { id: id.value } });
            return Result.ok();
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
}
