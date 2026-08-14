import { IInvoiceRepository } from "../../../business/invoice/repositories/IInvoiceRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Invoice } from "../../../business/invoice/aggregates/Invoice.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { InvoiceNumber } from "../../../business/invoice/value-objects/InvoiceNumber.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { InvoiceExtractor } from "../../persistence/extractors/InvoiceExtractor.js";
import { InvoiceHydrator } from "../../persistence/hydrators/InvoiceHydrator.js";

/**
 * Concrete infrastructure repository implementing Invoice persistence operations.
 */
export class InvoiceRepository extends BaseRepository implements IInvoiceRepository {
  public async findById(id: InvoiceId): Promise<Result<Invoice>> {
    try {
      const invoiceRow = await (this.prisma as any).invoice.findUnique({
        where: { id: id.value }
      });
      if (!invoiceRow) {
        return Result.fail(ResultError.notFound(`Invoice with ID ${id.value} not found.`));
      }

      const lines = await (this.prisma as any).invoiceLineItem.findMany({
        where: { invoiceId: id.value }
      });
      const notes = await (this.prisma as any).invoiceNote.findMany({
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
        lines: lines.map((l: any) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          price: l.price,
          taxRate: l.taxRate,
          amount: l.amount
        })),
        notes: notes.map((n: any) => ({
          id: n.id,
          content: n.content,
          authorId: n.authorId,
          createdAt: n.createdAt
        })),
        createdAt: invoiceRow.createdAt,
        updatedAt: invoiceRow.updatedAt
      };

      const aggregate = InvoiceHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByInvoiceNumber(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<Invoice>> {
    try {
      const invoiceRow = await (this.prisma as any).invoice.findFirst({
        where: {
          organizationId: orgId.value,
          invoiceNumber: number.value
        }
      });
      if (!invoiceRow) {
        return Result.fail(
          ResultError.notFound(
            `Invoice with number ${number.value} under organization ${orgId.value} not found.`
          )
        );
      }

      const idVal = invoiceRow.id;
      const lines = await (this.prisma as any).invoiceLineItem.findMany({ where: { invoiceId: idVal } });
      const notes = await (this.prisma as any).invoiceNote.findMany({ where: { invoiceId: idVal } });

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
        lines: lines.map((l: any) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          price: l.price,
          taxRate: l.taxRate,
          amount: l.amount
        })),
        notes: notes.map((n: any) => ({
          id: n.id,
          content: n.content,
          authorId: n.authorId,
          createdAt: n.createdAt
        })),
        createdAt: invoiceRow.createdAt,
        updatedAt: invoiceRow.updatedAt
      };

      const aggregate = InvoiceHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByCustomer(orgId: OrganizationId, customerId: CustomerId): Promise<Result<Invoice[]>> {
    try {
      const invoiceRows = await (this.prisma as any).invoice.findMany({
        where: {
          organizationId: orgId.value,
          customerId: customerId.value
        }
      });

      const aggregates: Invoice[] = [];
      for (const row of invoiceRows) {
        const lines = await (this.prisma as any).invoiceLineItem.findMany({ where: { invoiceId: row.id } });
        const notes = await (this.prisma as any).invoiceNote.findMany({ where: { invoiceId: row.id } });

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
          lines: lines.map((l: any) => ({
            id: l.id,
            description: l.description,
            quantity: l.quantity,
            price: l.price,
            taxRate: l.taxRate,
            amount: l.amount
          })),
          notes: notes.map((n: any) => ({
            id: n.id,
            content: n.content,
            authorId: n.authorId,
            createdAt: n.createdAt
          })),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };

        aggregates.push(InvoiceHydrator.hydrate(snapshot));
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByOrganization(orgId: OrganizationId): Promise<Result<Invoice[]>> {
    try {
      const invoiceRows = await (this.prisma as any).invoice.findMany({
        where: { organizationId: orgId.value }
      });

      const aggregates: Invoice[] = [];
      for (const row of invoiceRows) {
        const lines = await (this.prisma as any).invoiceLineItem.findMany({ where: { invoiceId: row.id } });
        const notes = await (this.prisma as any).invoiceNote.findMany({ where: { invoiceId: row.id } });

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
          lines: lines.map((l: any) => ({
            id: l.id,
            description: l.description,
            quantity: l.quantity,
            price: l.price,
            taxRate: l.taxRate,
            amount: l.amount
          })),
          notes: notes.map((n: any) => ({
            id: n.id,
            content: n.content,
            authorId: n.authorId,
            createdAt: n.createdAt
          })),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };

        aggregates.push(InvoiceHydrator.hydrate(snapshot));
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async exists(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<boolean>> {
    try {
      const count = await (this.prisma as any).invoice.count({
        where: {
          organizationId: orgId.value,
          invoiceNumber: number.value
        }
      });
      return Result.ok(count > 0);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(invoice: Invoice): Promise<Result<void>> {
    try {
      const { invoice: invoiceRow, lines, notes } = InvoiceExtractor.extract(invoice);

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
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

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: InvoiceId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.invoiceLineItem.deleteMany({ where: { invoiceId: id.value } });
        await txPrisma.invoiceNote.deleteMany({ where: { invoiceId: id.value } });
        await txPrisma.invoice.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
