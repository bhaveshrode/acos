import { IPaymentRepository } from "../../../business/payment/repositories/IPaymentRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Payment } from "../../../business/payment/aggregates/Payment.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { PaymentReference } from "../../../business/payment/value-objects/PaymentReference.js";
import { TransactionHash } from "../../../business/payment/value-objects/TransactionHash.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { PaymentSerializer } from "../../persistence/serializers/PaymentSerializer.js";
import { PaymentHydrator } from "../../persistence/hydrators/PaymentHydrator.js";

/**
 * Concrete infrastructure repository implementing Payment persistence operations.
 */
export class PaymentRepository extends BaseRepository implements IPaymentRepository {
  public async findById(id: PaymentId): Promise<Result<Payment>> {
    try {
      const row = await (this.prisma as any).payment.findUnique({
        where: { id: id.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Payment with ID ${id.value} not found.`));
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

      const aggregate = PaymentHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByReference(orgId: OrganizationId, ref: PaymentReference): Promise<Result<Payment>> {
    try {
      const row = await (this.prisma as any).payment.findFirst({
        where: {
          organizationId: orgId.value,
          reference: ref.value
        }
      });
      if (!row) {
        return Result.fail(
          ResultError.notFound(
            `Payment with reference ${ref.value} under organization ${orgId.value} not found.`
          )
        );
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

      const aggregate = PaymentHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByTransactionHash(hash: TransactionHash): Promise<Result<Payment>> {
    try {
      const row = await (this.prisma as any).payment.findFirst({
        where: { transactionHash: hash.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Payment with transaction hash ${hash.value} not found.`));
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

      const aggregate = PaymentHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<Payment[]>> {
    try {
      const rows = await (this.prisma as any).payment.findMany({
        where: {
          organizationId: orgId.value,
          invoiceId: invoiceId.value
        }
      });

      const aggregates = rows.map((row: any) => {
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
        return PaymentHydrator.hydrate(snapshot);
      });

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async existsHash(hash: TransactionHash): Promise<Result<boolean>> {
    try {
      const count = await (this.prisma as any).payment.count({
        where: { transactionHash: hash.value }
      });
      return Result.ok(count > 0);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(payment: Payment): Promise<Result<void>> {
    try {
      const snapshot = PaymentSerializer.serialize(payment);

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

      await (this.prisma as any).payment.upsert({
        where: { id: row.id },
        create: row,
        update: row
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: PaymentId): Promise<Result<void>> {
    try {
      await (this.prisma as any).payment.delete({
        where: { id: id.value }
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
