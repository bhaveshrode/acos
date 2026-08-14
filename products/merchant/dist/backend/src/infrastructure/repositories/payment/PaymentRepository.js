"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const BaseRepository_js_1 = require("../base/BaseRepository.js");
const Result_js_1 = require("../../../foundation/result/Result.js");
const ResultError_js_1 = require("../../../foundation/result/ResultError.js");
const PaymentSerializer_js_1 = require("../../persistence/serializers/PaymentSerializer.js");
const PaymentHydrator_js_1 = require("../../persistence/hydrators/PaymentHydrator.js");
/**
 * Concrete infrastructure repository implementing Payment persistence operations.
 */
class PaymentRepository extends BaseRepository_js_1.BaseRepository {
    async findById(id) {
        try {
            const row = await this.prisma.payment.findUnique({
                where: { id: id.value }
            });
            if (!row) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Payment with ID ${id.value} not found.`));
            }
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                invoiceId: row.invoiceId,
                reference: row.reference,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                blockchainReference: row.transactionHash
                    ? {
                        transactionHash: row.transactionHash,
                        blockNumber: row.blockNumber,
                        senderAddress: row.senderAddress
                    }
                    : null,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            const aggregate = PaymentHydrator_js_1.PaymentHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByReference(orgId, ref) {
        try {
            const row = await this.prisma.payment.findFirst({
                where: {
                    organizationId: orgId.value,
                    reference: ref.value
                }
            });
            if (!row) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Payment with reference ${ref.value} under organization ${orgId.value} not found.`));
            }
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                invoiceId: row.invoiceId,
                reference: row.reference,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                blockchainReference: row.transactionHash
                    ? {
                        transactionHash: row.transactionHash,
                        blockNumber: row.blockNumber,
                        senderAddress: row.senderAddress
                    }
                    : null,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            const aggregate = PaymentHydrator_js_1.PaymentHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByTransactionHash(hash) {
        try {
            const row = await this.prisma.payment.findFirst({
                where: { transactionHash: hash.value }
            });
            if (!row) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Payment with transaction hash ${hash.value} not found.`));
            }
            const snapshot = {
                id: row.id,
                organizationId: row.organizationId,
                invoiceId: row.invoiceId,
                reference: row.reference,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                blockchainReference: {
                    transactionHash: row.transactionHash,
                    blockNumber: row.blockNumber,
                    senderAddress: row.senderAddress
                },
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
            const aggregate = PaymentHydrator_js_1.PaymentHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByInvoice(orgId, invoiceId) {
        try {
            const rows = await this.prisma.payment.findMany({
                where: {
                    organizationId: orgId.value,
                    invoiceId: invoiceId.value
                }
            });
            const aggregates = rows.map((row) => {
                const snapshot = {
                    id: row.id,
                    organizationId: row.organizationId,
                    invoiceId: row.invoiceId,
                    reference: row.reference,
                    amount: row.amount,
                    currency: row.currency,
                    status: row.status,
                    blockchainReference: row.transactionHash
                        ? {
                            transactionHash: row.transactionHash,
                            blockNumber: row.blockNumber,
                            senderAddress: row.senderAddress
                        }
                        : null,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                };
                return PaymentHydrator_js_1.PaymentHydrator.hydrate(snapshot);
            });
            return Result_js_1.Result.ok(aggregates);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async existsHash(hash) {
        try {
            const count = await this.prisma.payment.count({
                where: { transactionHash: hash.value }
            });
            return Result_js_1.Result.ok(count > 0);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async save(payment) {
        try {
            const snapshot = PaymentSerializer_js_1.PaymentSerializer.serialize(payment);
            const row = {
                id: snapshot.id,
                organizationId: snapshot.organizationId,
                invoiceId: snapshot.invoiceId,
                reference: snapshot.reference,
                amount: snapshot.amount,
                currency: snapshot.currency,
                status: snapshot.status,
                transactionHash: snapshot.blockchainReference ? snapshot.blockchainReference.transactionHash : null,
                blockNumber: snapshot.blockchainReference ? snapshot.blockchainReference.blockNumber : null,
                senderAddress: snapshot.blockchainReference ? snapshot.blockchainReference.senderAddress : null,
                createdAt: snapshot.createdAt,
                updatedAt: snapshot.updatedAt
            };
            await this.prisma.payment.upsert({
                where: { id: row.id },
                create: row,
                update: row
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async delete(id) {
        try {
            await this.prisma.payment.delete({
                where: { id: id.value }
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
}
exports.PaymentRepository = PaymentRepository;
