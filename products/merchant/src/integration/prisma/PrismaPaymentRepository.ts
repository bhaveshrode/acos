import { PrismaClient } from "@prisma/client";
import {
  Result,
  ResultError,
  IPaymentRepository,
  Payment,
  PaymentId,
  PaymentReference,
  GatewayReference,
  OrganizationId as OrgId,
  InvoiceId as InvId
} from "acos-backend";
import { PaymentSnapshot } from "../../adapters/persistence/snapshots/PaymentSnapshot.js";
import { PaymentSerializer } from "../../adapters/persistence/serializers/PaymentSerializer.js";
import { PaymentHydrator } from "../../adapters/persistence/hydrators/PaymentHydrator.js";
import { TransactionScope } from "../../adapters/transactions/scopes/TransactionScope.js";

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  /** Joins the ambient unit of work when the boundary opened one. */
  private get db(): any {
    return TransactionScope.current ?? this.prisma;
  }

  private async loadRefunds(paymentId: string): Promise<any[]> {
    return this.db.refund.findMany({ where: { paymentId } });
  }

  /** Rebuilds the aggregate snapshot from the flat payment row and its refund rows. */
  private buildSnapshot(row: any, refundRows: any[]): PaymentSnapshot {
    return {
      id: row.id,
      organizationId: row.organizationId,
      customerId: "",
      reference: row.reference,
      amount: row.amount.toNumber(),
      currency: row.currency,
      status: row.status,
      methodType: row.method,
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
        amount: row.amount.toNumber(),
        currency: row.currency,
        status: row.status
      }],
      attempts: [],
      refundRequests: refundRows.map((refund) => ({
        id: refund.id,
        amount: refund.amount.toNumber(),
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        requestedAt: refund.createdAt
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    } as PaymentSnapshot;
  }

  public async findById(id: PaymentId): Promise<Result<Payment>> {
    try {
      const row = await this.db.payment.findUnique({ where: { id: id.value } });
      if (!row) return Result.fail(ResultError.notFound(`Payment with ID ${id.value} not found.`));

      const refundRows = await this.loadRefunds(row.id);
      return Result.ok(PaymentHydrator.hydrate(this.buildSnapshot(row, refundRows)));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByReference(orgId: OrgId, ref: PaymentReference): Promise<Result<Payment>> {
    try {
      const row = await this.db.payment.findFirst({
        where: { organizationId: orgId.value, reference: ref.value }
      });
      if (!row) return Result.fail(ResultError.notFound(`Payment reference not found.`));

      const refundRows = await this.loadRefunds(row.id);
      return Result.ok(PaymentHydrator.hydrate(this.buildSnapshot(row, refundRows)));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByGatewayReference(ref: GatewayReference): Promise<Result<Payment>> {
    try {
      const row = await this.db.payment.findFirst({
        where: { gatewayReference: ref.value }
      });
      if (!row) return Result.fail(ResultError.notFound(`Payment with gateway reference ${ref.value} not found.`));

      const refundRows = await this.loadRefunds(row.id);
      return Result.ok(PaymentHydrator.hydrate(this.buildSnapshot(row, refundRows)));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByInvoice(orgId: OrgId, invoiceId: InvId): Promise<Result<Payment[]>> {
    try {
      const rows = await this.db.payment.findMany({
        where: { organizationId: orgId.value, invoiceId: invoiceId.value }
      });
      const list: Payment[] = [];
      for (const row of rows) {
        const refundRows = await this.loadRefunds(row.id);
        list.push(PaymentHydrator.hydrate(this.buildSnapshot(row, refundRows)));
      }
      return Result.ok(list);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async exists(orgId: OrgId, ref: PaymentReference): Promise<Result<boolean>> {
    try {
      const count = await this.db.payment.count({
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

      await this.db.payment.upsert({
        where: { id: snapshot.id },
        create: {
          id: snapshot.id,
          organizationId: snapshot.organizationId,
          invoiceId,
          reference: snapshot.reference,
          amount: snapshot.amount,
          currency: snapshot.currency,
          status: snapshot.status,
          method: snapshot.methodType,
          gatewayReference
        },
        update: {
          organizationId: snapshot.organizationId,
          invoiceId,
          reference: snapshot.reference,
          amount: snapshot.amount,
          currency: snapshot.currency,
          status: snapshot.status,
          method: snapshot.methodType,
          gatewayReference
        }
      });

      for (const refund of snapshot.refundRequests) {
        await this.db.refund.upsert({
          where: { id: refund.id },
          create: {
            id: refund.id,
            paymentId: snapshot.id,
            organizationId: snapshot.organizationId,
            invoiceId,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            reason: refund.reason
          },
          update: {
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            reason: refund.reason
          }
        });
      }

      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: PaymentId): Promise<Result<void>> {
    try {
      await this.db.payment.delete({ where: { id: id.value } });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
