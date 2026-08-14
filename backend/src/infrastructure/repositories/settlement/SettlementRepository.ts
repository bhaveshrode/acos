import { ISettlementRepository } from "../../../business/settlement/repositories/ISettlementRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Settlement } from "../../../business/settlement/aggregates/Settlement.js";
import { SettlementId } from "../../../business/settlement/value-objects/SettlementId.js";
import { SettlementReference } from "../../../business/settlement/value-objects/SettlementReference.js";
import { TransactionHash } from "../../../business/settlement/value-objects/TransactionHash.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { SettlementSerializer } from "../../persistence/serializers/SettlementSerializer.js";
import { SettlementHydrator } from "../../persistence/hydrators/SettlementHydrator.js";

/**
 * Concrete infrastructure repository implementing Settlement persistence operations.
 */
export class SettlementRepository extends BaseRepository implements ISettlementRepository {
  public async findById(id: SettlementId): Promise<Result<Settlement>> {
    try {
      const row = await (this.prisma as any).settlement.findUnique({
        where: { id: id.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Settlement with ID ${id.value} not found.`));
      }

      const confirmations = await (this.prisma as any).settlementConfirmation.findMany({
        where: { settlementId: id.value }
      });
      const treasuryReceipts = await (this.prisma as any).treasuryReceipt.findMany({
        where: { settlementId: id.value }
      });
      const notes = await (this.prisma as any).settlementNote.findMany({
        where: { settlementId: id.value }
      });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        paymentId: row.paymentId,
        reference: row.reference,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        method: row.method,
        confirmationThreshold: row.confirmationThreshold,
        confirmations: confirmations.map((c: any) => ({
          id: c.id,
          source: c.source,
          count: c.count,
          timestamp: c.timestamp
        })),
        treasuryReceipts: treasuryReceipts.map((tr: any) => ({
          id: tr.id,
          wallet: tr.wallet,
          amount: tr.amount,
          currency: tr.currency,
          timestamp: tr.timestamp,
          treasuryReference: tr.treasuryReference
        })),
        notes: notes.map((n: any) => ({
          id: n.id,
          content: n.text || n.content,
          authorId: n.authorId,
          createdAt: n.createdAt
        })),
        blockNumber: row.blockNumber,
        transactionHash: row.transactionHash,
        metadata: row.metadata,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = SettlementHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByReference(orgId: OrganizationId, ref: SettlementReference): Promise<Result<Settlement>> {
    try {
      const row = await (this.prisma as any).settlement.findFirst({
        where: {
          organizationId: orgId.value,
          reference: ref.value
        }
      });
      if (!row) {
        return Result.fail(
          ResultError.notFound(
            `Settlement with reference ${ref.value} under organization ${orgId.value} not found.`
          )
        );
      }

      const idVal = row.id;
      const confirmations = await (this.prisma as any).settlementConfirmation.findMany({ where: { settlementId: idVal } });
      const treasuryReceipts = await (this.prisma as any).treasuryReceipt.findMany({ where: { settlementId: idVal } });
      const notes = await (this.prisma as any).settlementNote.findMany({ where: { settlementId: idVal } });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        paymentId: row.paymentId,
        reference: row.reference,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        method: row.method,
        confirmationThreshold: row.confirmationThreshold,
        confirmations: confirmations.map((c: any) => ({
          id: c.id,
          source: c.source,
          count: c.count,
          timestamp: c.timestamp
        })),
        treasuryReceipts: treasuryReceipts.map((tr: any) => ({
          id: tr.id,
          wallet: tr.wallet,
          amount: tr.amount,
          currency: tr.currency,
          timestamp: tr.timestamp,
          treasuryReference: tr.treasuryReference
        })),
        notes: notes.map((n: any) => ({
          id: n.id,
          content: n.text || n.content,
          authorId: n.authorId,
          createdAt: n.createdAt
        })),
        blockNumber: row.blockNumber,
        transactionHash: row.transactionHash,
        metadata: row.metadata,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = SettlementHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByPayment(orgId: OrganizationId, paymentId: PaymentId): Promise<Result<Settlement>> {
    try {
      const row = await (this.prisma as any).settlement.findFirst({
        where: {
          organizationId: orgId.value,
          paymentId: paymentId.value
        }
      });
      if (!row) {
        return Result.fail(
          ResultError.notFound(
            `Settlement for payment ${paymentId.value} under organization ${orgId.value} not found.`
          )
        );
      }

      const idVal = row.id;
      const confirmations = await (this.prisma as any).settlementConfirmation.findMany({ where: { settlementId: idVal } });
      const treasuryReceipts = await (this.prisma as any).treasuryReceipt.findMany({ where: { settlementId: idVal } });
      const notes = await (this.prisma as any).settlementNote.findMany({ where: { settlementId: idVal } });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        paymentId: row.paymentId,
        reference: row.reference,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        method: row.method,
        confirmationThreshold: row.confirmationThreshold,
        confirmations: confirmations.map((c: any) => ({
          id: c.id,
          source: c.source,
          count: c.count,
          timestamp: c.timestamp
        })),
        treasuryReceipts: treasuryReceipts.map((tr: any) => ({
          id: tr.id,
          wallet: tr.wallet,
          amount: tr.amount,
          currency: tr.currency,
          timestamp: tr.timestamp,
          treasuryReference: tr.treasuryReference
        })),
        notes: notes.map((n: any) => ({
          id: n.id,
          content: n.text || n.content,
          authorId: n.authorId,
          createdAt: n.createdAt
        })),
        blockNumber: row.blockNumber,
        transactionHash: row.transactionHash,
        metadata: row.metadata,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = SettlementHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByTransactionHash(hash: TransactionHash): Promise<Result<Settlement>> {
    try {
      const row = await (this.prisma as any).settlement.findFirst({
        where: { transactionHash: hash.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Settlement with transaction hash ${hash.value} not found.`));
      }

      const idVal = row.id;
      const confirmations = await (this.prisma as any).settlementConfirmation.findMany({ where: { settlementId: idVal } });
      const treasuryReceipts = await (this.prisma as any).treasuryReceipt.findMany({ where: { settlementId: idVal } });
      const notes = await (this.prisma as any).settlementNote.findMany({ where: { settlementId: idVal } });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        paymentId: row.paymentId,
        reference: row.reference,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        method: row.method,
        confirmationThreshold: row.confirmationThreshold,
        confirmations: confirmations.map((c: any) => ({
          id: c.id,
          source: c.source,
          count: c.count,
          timestamp: c.timestamp
        })),
        treasuryReceipts: treasuryReceipts.map((tr: any) => ({
          id: tr.id,
          wallet: tr.wallet,
          amount: tr.amount,
          currency: tr.currency,
          timestamp: tr.timestamp,
          treasuryReference: tr.treasuryReference
        })),
        notes: notes.map((n: any) => ({
          id: n.id,
          content: n.text || n.content,
          authorId: n.authorId,
          createdAt: n.createdAt
        })),
        blockNumber: row.blockNumber,
        transactionHash: row.transactionHash,
        metadata: row.metadata,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = SettlementHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(settlement: Settlement): Promise<Result<void>> {
    try {
      const snapshot = SettlementSerializer.serialize(settlement);

      const row = {
        id: snapshot.id,
        organizationId: snapshot.organizationId,
        paymentId: snapshot.paymentId,
        reference: snapshot.reference,
        amount: snapshot.amount,
        currency: snapshot.currency,
        status: snapshot.status,
        method: snapshot.method,
        confirmationThreshold: snapshot.confirmationThreshold,
        blockNumber: snapshot.blockNumber,
        transactionHash: snapshot.transactionHash,
        metadata: snapshot.metadata,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt
      };

      const confirmations = snapshot.confirmations.map((c) => ({
        id: c.id,
        settlementId: snapshot.id,
        source: c.source,
        count: c.count,
        timestamp: c.timestamp
      }));

      const treasuryReceipts = snapshot.treasuryReceipts.map((tr) => ({
        id: tr.id,
        settlementId: snapshot.id,
        wallet: tr.wallet,
        amount: tr.amount,
        currency: tr.currency,
        timestamp: tr.timestamp,
        treasuryReference: tr.treasuryReference
      }));

      const notes = snapshot.notes.map((n) => ({
        id: n.id,
        settlementId: snapshot.id,
        text: n.content,
        authorId: n.authorId,
        createdAt: n.createdAt
      }));

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.settlement.upsert({
          where: { id: row.id },
          create: row,
          update: row
        });

        // Sync confirmations
        await txPrisma.settlementConfirmation.deleteMany({ where: { settlementId: row.id } });
        if (confirmations.length > 0) {
          await txPrisma.settlementConfirmation.createMany({ data: confirmations });
        }

        // Sync treasury receipts
        await txPrisma.treasuryReceipt.deleteMany({ where: { settlementId: row.id } });
        if (treasuryReceipts.length > 0) {
          await txPrisma.treasuryReceipt.createMany({ data: treasuryReceipts });
        }

        // Sync notes
        await txPrisma.settlementNote.deleteMany({ where: { settlementId: row.id } });
        if (notes.length > 0) {
          await txPrisma.settlementNote.createMany({ data: notes });
        }
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: SettlementId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.settlementConfirmation.deleteMany({ where: { settlementId: id.value } });
        await txPrisma.treasuryReceipt.deleteMany({ where: { settlementId: id.value } });
        await txPrisma.settlementNote.deleteMany({ where: { settlementId: id.value } });
        await txPrisma.settlement.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
