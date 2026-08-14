import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { PaymentSerializer } from "acos-backend/infrastructure/persistence/serializers/PaymentSerializer.js";
import { PaymentHydrator } from "acos-backend/infrastructure/persistence/hydrators/PaymentHydrator.js";
export class PrismaPaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        try {
            const row = await this.prisma.payment.findUnique({ where: { id: id.value } });
            if (!row)
                return Result.fail(ResultError.notFound(`Payment with ID ${id.value} not found.`));
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                customerId: "",
                reference: row.reference,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                methodType: "SANDBOX",
                methodDetails: "{}",
                transactionHash: null,
                gatewayReference: row.gatewayReference,
                walletAddress: null,
                metadata: {},
                confirmations: 1,
                exchangeRate: null,
                allocations: [{
                        id: row.id,
                        invoiceId: row.invoiceId,
                        amount: row.amount,
                        currency: row.currency,
                        status: row.status
                    }],
                attempts: [],
                refundRequests: [],
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            return Result.ok(PaymentHydrator.hydrate(snapshot));
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async findByReference(orgId, ref) {
        try {
            const row = await this.prisma.payment.findFirst({
                where: { organizationId: orgId.value, reference: ref.value }
            });
            if (!row)
                return Result.fail(ResultError.notFound(`Payment reference not found.`));
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                customerId: "",
                reference: row.reference,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                methodType: "SANDBOX",
                methodDetails: "{}",
                transactionHash: null,
                gatewayReference: row.gatewayReference,
                walletAddress: null,
                metadata: {},
                confirmations: 1,
                exchangeRate: null,
                allocations: [{
                        id: row.id,
                        invoiceId: row.invoiceId,
                        amount: row.amount,
                        currency: row.currency,
                        status: row.status
                    }],
                attempts: [],
                refundRequests: [],
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            return Result.ok(PaymentHydrator.hydrate(snapshot));
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async findByTransactionHash(hash) {
        return Result.fail(ResultError.notFound("Blockchain transactions not supported by Prisma adapter."));
    }
    async existsHash(hash) {
        return Result.ok(false);
    }
    async findByInvoice(orgId, invoiceId) {
        try {
            const rows = await this.prisma.payment.findMany({
                where: { organizationId: orgId.value, invoiceId: invoiceId.value }
            });
            const list = rows.map((row) => {
                const snapshot = {
                    id: row.id,
                    organizationId: row.organizationId,
                    customerId: "",
                    reference: row.reference,
                    amount: row.amount,
                    currency: row.currency,
                    status: row.status,
                    methodType: "SANDBOX",
                    methodDetails: "{}",
                    transactionHash: null,
                    gatewayReference: row.gatewayReference,
                    walletAddress: null,
                    metadata: {},
                    confirmations: 1,
                    exchangeRate: null,
                    allocations: [{
                            id: row.id,
                            invoiceId: row.invoiceId,
                            amount: row.amount,
                            currency: row.currency,
                            status: row.status
                        }],
                    attempts: [],
                    refundRequests: [],
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                };
                return PaymentHydrator.hydrate(snapshot);
            });
            return Result.ok(list);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async exists(orgId, ref) {
        try {
            const count = await this.prisma.payment.count({
                where: { organizationId: orgId.value, reference: ref.value }
            });
            return Result.ok(count > 0);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async save(payment) {
        try {
            const snapshot = PaymentSerializer.serialize(payment);
            const invoiceId = snapshot.allocations[0]?.invoiceId || "";
            const gatewayReference = snapshot.gatewayReference || `gtwy_${snapshot.reference}`;
            await this.prisma.payment.upsert({
                where: { id: snapshot.id },
                create: {
                    id: snapshot.id,
                    organizationId: snapshot.organizationId,
                    invoiceId,
                    reference: snapshot.reference,
                    amount: snapshot.amount,
                    currency: snapshot.currency,
                    status: snapshot.status,
                    gatewayReference
                },
                update: {
                    organizationId: snapshot.organizationId,
                    invoiceId,
                    reference: snapshot.reference,
                    amount: snapshot.amount,
                    currency: snapshot.currency,
                    status: snapshot.status,
                    gatewayReference
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
            await this.prisma.payment.delete({ where: { id: id.value } });
            return Result.ok();
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
}
