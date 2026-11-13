import { PrismaClient } from "@prisma/client";
import {
  Result,
  ResultError,
  IInvoiceRepository,
  Invoice,
  InvoiceId,
  InvoiceNumber,
  OrganizationId as OrgId,
  CustomerId
} from "acos-backend";
import { InvoiceExtractor } from "../../adapters/persistence/extractors/InvoiceExtractor.js";
import { InvoiceHydrator } from "../../adapters/persistence/hydrators/InvoiceHydrator.js";
import { TransactionScope } from "../../adapters/transactions/scopes/TransactionScope.js";

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  /** Joins the ambient unit of work when the boundary opened one. */
  private get db(): any {
    return TransactionScope.current ?? this.prisma;
  }

  public async findById(id: InvoiceId): Promise<Result<Invoice>> {
    try {
      const row = await this.db.invoice.findUnique({
        where: { id: id.value },
        include: { lineItems: true }
      });
      if (!row) return Result.fail(ResultError.notFound(`Invoice with ID ${id.value} not found.`));

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
        subtotal: row.totalAmount.toNumber(),
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: row.totalAmount.toNumber(),
        discount: null,
        period: null,
        lines: row.lineItems.map((l: any) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          price: l.price.toNumber(),
          taxRate: 0,
          amount: l.amount.toNumber()
        })),
        notes: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      return Result.ok(InvoiceHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      console.error("[PrismaInvoiceRepository] findById Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByInvoiceNumber(orgId: OrgId, number: InvoiceNumber): Promise<Result<Invoice>> {
    try {
      const row = await this.db.invoice.findFirst({
        where: { organizationId: orgId.value, invoiceNumber: number.value },
        include: { lineItems: true }
      });
      if (!row) return Result.fail(ResultError.notFound(`Invoice not found.`));

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
        subtotal: row.totalAmount.toNumber(),
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: row.totalAmount.toNumber(),
        discount: null,
        period: null,
        lines: row.lineItems.map((l: any) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          price: l.price.toNumber(),
          taxRate: 0,
          amount: l.amount.toNumber()
        })),
        notes: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      return Result.ok(InvoiceHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByCustomer(orgId: OrgId, customerId: CustomerId): Promise<Result<Invoice[]>> {
    try {
      const rows = await this.db.invoice.findMany({
        where: { organizationId: orgId.value, customerId: customerId.value },
        include: { lineItems: true }
      });

      const list = rows.map((row: any) => {
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
          subtotal: row.totalAmount.toNumber(),
          taxTotal: 0,
          discountTotal: 0,
          grandTotal: row.totalAmount.toNumber(),
          discount: null,
          period: null,
          lines: row.lineItems.map((l: any) => ({
            id: l.id,
            description: l.description,
            quantity: l.quantity,
            price: l.price.toNumber(),
            taxRate: 0,
            amount: l.amount.toNumber()
          })),
          notes: [],
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
        return InvoiceHydrator.hydrate(snapshot as any);
      });
      return Result.ok(list);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByOrganization(orgId: OrgId): Promise<Result<Invoice[]>> {
    try {
      const rows = await this.db.invoice.findMany({
        where: { organizationId: orgId.value },
        include: { lineItems: true }
      });

      const list = rows.map((row: any) => {
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
          subtotal: row.totalAmount.toNumber(),
          taxTotal: 0,
          discountTotal: 0,
          grandTotal: row.totalAmount.toNumber(),
          discount: null,
          period: null,
          lines: row.lineItems.map((l: any) => ({
            id: l.id,
            description: l.description,
            quantity: l.quantity,
            price: l.price.toNumber(),
            taxRate: 0,
            amount: l.amount.toNumber()
          })),
          notes: [],
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
        return InvoiceHydrator.hydrate(snapshot as any);
      });
      return Result.ok(list);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async exists(orgId: OrgId, number: InvoiceNumber): Promise<Result<boolean>> {
    try {
      const count = await this.db.invoice.count({
        where: { organizationId: orgId.value, invoiceNumber: number.value }
      });
      return Result.ok(count > 0);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async save(invoice: Invoice): Promise<Result<void>> {
    try {
      const { invoice: inv, lines } = InvoiceExtractor.extract(invoice);

      if (TransactionScope.current) {
        await this.writeLocked(this.db, inv, lines);
        return Result.ok();
      }

      await this.prisma.$transaction(async (tx) => {
        await this.writeLocked(tx, inv, lines);
      });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  private async writeLocked(
    tx: any,
    inv: Record<string, any>,
    lines: Array<Record<string, any>>
  ): Promise<void> {
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
  }

  public async delete(id: InvoiceId): Promise<Result<void>> {
    try {
      await this.db.invoice.delete({ where: { id: id.value } });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
