import { PrismaClient } from "@prisma/client";
import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { IPaymentRepository } from "acos-backend/business/payment/repositories/IPaymentRepository.js";
import { Payment } from "acos-backend/business/payment/aggregates/Payment.js";
import { PaymentId } from "acos-backend/business/payment/value-objects/PaymentId.js";
import { PaymentReference } from "acos-backend/business/payment/value-objects/PaymentReference.js";
import { TransactionHash } from "acos-backend/business/payment/value-objects/TransactionHash.js";
import { OrganizationId as OrgId } from "acos-backend/business/organization/value-objects/OrganizationId.js";
import { InvoiceId as InvId } from "acos-backend/business/invoice/value-objects/InvoiceId.js";
import { PaymentSerializer } from "acos-backend/infrastructure/persistence/serializers/PaymentSerializer.js";
import { PaymentHydrator } from "acos-backend/infrastructure/persistence/hydrators/PaymentHydrator.js";

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: PaymentId): Promise<Result<Payment>> {
    try {
      const row = await this.prisma.payment.findUnique({ where: { id: id.value } });
      if (!row) return Result.fail(ResultError.notFound(`Payment with ID ${id.value} not found.`));

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

      return Result.ok(PaymentHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByReference(orgId: OrgId, ref: PaymentReference): Promise<Result<Payment>> {
    try {
      const row = await this.prisma.payment.findFirst({
        where: { organizationId: orgId.value, reference: ref.value }
      });
      if (!row) return Result.fail(ResultError.notFound(`Payment reference not found.`));

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

      return Result.ok(PaymentHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByTransactionHash(hash: TransactionHash): Promise<Result<Payment>> {
    return Result.fail(ResultError.notFound("Blockchain transactions not supported by Prisma adapter."));
  }

  public async existsHash(hash: TransactionHash): Promise<Result<boolean>> {
    return Result.ok(false);
  }

  public async findByInvoice(orgId: OrgId, invoiceId: InvId): Promise<Result<Payment[]>> {
    try {
      const rows = await this.prisma.payment.findMany({
        where: { organizationId: orgId.value, invoiceId: invoiceId.value }
      });
      const list = rows.map((row: any) => {
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
        return PaymentHydrator.hydrate(snapshot as any);
      });
      return Result.ok(list);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async exists(orgId: OrgId, ref: PaymentReference): Promise<Result<boolean>> {
    try {
      const count = await this.prisma.payment.count({
        where: { organizationId: orgId.value, reference: ref.value }
      });
      return Result.ok(count > 0);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async save(payment: Payment): Promise<Result<void>> {
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
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: PaymentId): Promise<Result<void>> {
    try {
      await this.prisma.payment.delete({ where: { id: id.value } });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
