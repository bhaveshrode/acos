import { PrismaClient } from "@prisma/client";
import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { ICustomerRepository } from "acos-backend/business/customer/repositories/ICustomerRepository.js";
import { Customer } from "acos-backend/business/customer/aggregates/Customer.js";
import { CustomerId } from "acos-backend/business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "acos-backend/business/customer/value-objects/CustomerNumber.js";
import { OrganizationId as OrgId } from "acos-backend/business/organization/value-objects/OrganizationId.js";
import { CustomerExtractor } from "acos-backend/infrastructure/persistence/extractors/CustomerExtractor.js";
import { CustomerHydrator } from "acos-backend/infrastructure/persistence/hydrators/CustomerHydrator.js";

export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: CustomerId): Promise<Result<Customer>> {
    try {
      console.error("[PrismaCustomerRepository] findById called with ID:", id.value);
      const row = await this.prisma.customer.findUnique({ where: { id: id.value } });
      if (!row) {
        console.error("[PrismaCustomerRepository] findById: Customer not found in DB for ID:", id.value);
        return Result.fail(ResultError.notFound(`Customer with ID ${id.value} not found.`));
      }

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        customerNumber: row.customerNumber,
        name: row.name,
        companyName: row.name,
        status: "ACTIVE",
        taxIdentifier: "",
        phoneNumber: "",
        communicationPreferences: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: false
        },
        addresses: [
          { id: "a0000000-0000-4000-8000-000000000001", line1: row.billingAddress, city: "Metropolis", state: "NY", country: "USA", postalCode: "10001", type: "BILLING" }
        ],
        contacts: [
          { id: "c0000000-0000-4000-8000-000000000001", name: row.name, email: row.primaryContact, phone: "", isPrimary: true }
        ],
        notes: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      return Result.ok(CustomerHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      console.error("[PrismaCustomerRepository] findById Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByCustomerNumber(orgId: OrgId, number: CustomerNumber): Promise<Result<Customer>> {
    try {
      const row = await this.prisma.customer.findFirst({
        where: { organizationId: orgId.value, customerNumber: number.value }
      });
      if (!row) return Result.fail(ResultError.notFound(`Customer not found.`));

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        customerNumber: row.customerNumber,
        name: row.name,
        companyName: row.name,
        status: "ACTIVE",
        taxIdentifier: "",
        phoneNumber: "",
        communicationPreferences: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: false
        },
        addresses: [
          { id: "a0000000-0000-4000-8000-000000000001", line1: row.billingAddress, city: "Metropolis", state: "NY", country: "USA", postalCode: "10001", type: "BILLING" }
        ],
        contacts: [
          { id: "c0000000-0000-4000-8000-000000000001", name: row.name, email: row.primaryContact, phone: "", isPrimary: true }
        ],
        notes: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      return Result.ok(CustomerHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByOrganization(orgId: OrgId): Promise<Result<Customer[]>> {
    try {
      const rows = await this.prisma.customer.findMany({ where: { organizationId: orgId.value } });
      const list = rows.map((row) => {
        const snapshot = {
          id: row.id,
          organizationId: row.organizationId,
          customerNumber: row.customerNumber,
          name: row.name,
          companyName: row.name,
          status: "ACTIVE",
          taxIdentifier: "",
          phoneNumber: "",
          communicationPreferences: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: false
          },
          addresses: [
            { id: "a0000000-0000-4000-8000-000000000001", line1: row.billingAddress, city: "Metropolis", state: "NY", country: "USA", postalCode: "10001", type: "BILLING" }
          ],
          contacts: [
            { id: "c0000000-0000-4000-8000-000000000001", name: row.name, email: row.primaryContact, phone: "", isPrimary: true }
          ],
          notes: [],
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
        return CustomerHydrator.hydrate(snapshot as any);
      });
      return Result.ok(list);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async exists(orgId: OrgId, number: CustomerNumber): Promise<Result<boolean>> {
    try {
      const count = await this.prisma.customer.count({
        where: { organizationId: orgId.value, customerNumber: number.value }
      });
      return Result.ok(count > 0);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async save(customer: Customer): Promise<Result<void>> {
    try {
      const { customer: c } = CustomerExtractor.extract(customer);
      const emailVal = customer.contacts[0]?.email?.value || (customer.contacts[0]?.email as any) || "";
      const streetVal = customer.addresses[0]?.address?.line1 || (customer.addresses[0] as any)?.street || "";

      console.error("[PrismaCustomerRepository] save: upserting customer ID:", c.id);
      await this.prisma.customer.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          organizationId: c.organizationId,
          customerNumber: c.customerNumber,
          name: c.name,
          primaryContact: emailVal,
          billingAddress: streetVal
        },
        update: {
          organizationId: c.organizationId,
          customerNumber: c.customerNumber,
          name: c.name,
          primaryContact: emailVal,
          billingAddress: streetVal
        }
      });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: CustomerId): Promise<Result<void>> {
    try {
      await this.prisma.customer.delete({ where: { id: id.value } });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
