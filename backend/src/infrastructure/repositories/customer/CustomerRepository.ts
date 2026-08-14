import { ICustomerRepository } from "../../../business/customer/repositories/ICustomerRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "../../../business/customer/value-objects/CustomerNumber.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { CustomerExtractor } from "../../persistence/extractors/CustomerExtractor.js";
import { CustomerHydrator } from "../../persistence/hydrators/CustomerHydrator.js";

/**
 * Concrete infrastructure repository implementing Customer persistence operations.
 */
export class CustomerRepository extends BaseRepository implements ICustomerRepository {
  public async findById(id: CustomerId): Promise<Result<Customer>> {
    try {
      const customerRow = await (this.prisma as any).customer.findUnique({
        where: { id: id.value }
      });
      if (!customerRow) {
        return Result.fail(ResultError.notFound(`Customer with ID ${id.value} not found.`));
      }

      const addresses = await (this.prisma as any).customerAddress.findMany({
        where: { customerId: id.value }
      });
      const contacts = await (this.prisma as any).customerContact.findMany({
        where: { customerId: id.value }
      });
      const notes = await (this.prisma as any).customerNote.findMany({
        where: { customerId: id.value }
      });

      const snapshot = {
        ...customerRow,
        addresses,
        contacts,
        notes,
        communicationPreferences: {
          emailEnabled: customerRow.emailEnabled ?? true,
          smsEnabled: customerRow.smsEnabled ?? true,
          pushEnabled: customerRow.pushEnabled ?? true
        }
      };

      const aggregate = CustomerHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByCustomerNumber(orgId: OrganizationId, number: CustomerNumber): Promise<Result<Customer>> {
    try {
      const customerRow = await (this.prisma as any).customer.findFirst({
        where: {
          organizationId: orgId.value,
          customerNumber: number.value
        }
      });
      if (!customerRow) {
        return Result.fail(
          ResultError.notFound(
            `Customer with number ${number.value} under organization ${orgId.value} not found.`
          )
        );
      }

      const idVal = customerRow.id;
      const addresses = await (this.prisma as any).customerAddress.findMany({ where: { customerId: idVal } });
      const contacts = await (this.prisma as any).customerContact.findMany({ where: { customerId: idVal } });
      const notes = await (this.prisma as any).customerNote.findMany({ where: { customerId: idVal } });

      const snapshot = {
        ...customerRow,
        addresses,
        contacts,
        notes,
        communicationPreferences: {
          emailEnabled: customerRow.emailEnabled ?? true,
          smsEnabled: customerRow.smsEnabled ?? true,
          pushEnabled: customerRow.pushEnabled ?? true
        }
      };

      const aggregate = CustomerHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByOrganization(orgId: OrganizationId): Promise<Result<Customer[]>> {
    try {
      const customerRows = await (this.prisma as any).customer.findMany({
        where: { organizationId: orgId.value }
      });

      const aggregates: Customer[] = [];
      for (const row of customerRows) {
        const addresses = await (this.prisma as any).customerAddress.findMany({ where: { customerId: row.id } });
        const contacts = await (this.prisma as any).customerContact.findMany({ where: { customerId: row.id } });
        const notes = await (this.prisma as any).customerNote.findMany({ where: { customerId: row.id } });

        const snapshot = {
          ...row,
          addresses,
          contacts,
          notes,
          communicationPreferences: {
            emailEnabled: row.emailEnabled ?? true,
            smsEnabled: row.smsEnabled ?? true,
            pushEnabled: row.pushEnabled ?? true
          }
        };
        aggregates.push(CustomerHydrator.hydrate(snapshot));
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async exists(orgId: OrganizationId, number: CustomerNumber): Promise<Result<boolean>> {
    try {
      const count = await (this.prisma as any).customer.count({
        where: {
          organizationId: orgId.value,
          customerNumber: number.value
        }
      });
      return Result.ok(count > 0);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(customer: Customer): Promise<Result<void>> {
    try {
      const { customer: customerRow, addresses, contacts, notes } = CustomerExtractor.extract(customer);
      const row = {
        ...customerRow,
        emailEnabled: customer.communicationPreferences.email,
        smsEnabled: customer.communicationPreferences.sms,
        pushEnabled: customer.communicationPreferences.push
      };

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.customer.upsert({
          where: { id: row.id },
          create: row,
          update: row
        });

        // Sync addresses
        await txPrisma.customerAddress.deleteMany({ where: { customerId: customerRow.id } });
        if (addresses.length > 0) {
          await txPrisma.customerAddress.createMany({ data: addresses });
        }

        // Sync contacts
        await txPrisma.customerContact.deleteMany({ where: { customerId: customerRow.id } });
        if (contacts.length > 0) {
          await txPrisma.customerContact.createMany({ data: contacts });
        }

        // Sync notes
        await txPrisma.customerNote.deleteMany({ where: { customerId: customerRow.id } });
        if (notes.length > 0) {
          await txPrisma.customerNote.createMany({ data: notes });
        }
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: CustomerId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.customerAddress.deleteMany({ where: { customerId: id.value } });
        await txPrisma.customerContact.deleteMany({ where: { customerId: id.value } });
        await txPrisma.customerNote.deleteMany({ where: { customerId: id.value } });
        await txPrisma.customer.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
