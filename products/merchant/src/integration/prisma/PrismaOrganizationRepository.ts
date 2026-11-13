import { PrismaClient } from "@prisma/client";
import {
  Result,
  ResultError,
  IOrganizationRepository,
  Organization,
  OrganizationId,
  OrganizationSlug
} from "acos-backend";
import { OrganizationSerializer } from "../../adapters/persistence/serializers/OrganizationSerializer.js";
import { OrganizationHydrator } from "../../adapters/persistence/hydrators/OrganizationHydrator.js";

export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: OrganizationId): Promise<Result<Organization>> {
    try {
      const row = await this.prisma.organization.findUnique({ where: { id: id.value } });
      if (!row) return Result.fail(ResultError.notFound(`Organization with ID ${id.value} not found.`));
      return Result.ok(this.toOrganization(row));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findBySlug(slug: OrganizationSlug): Promise<Result<Organization>> {
    try {
      const row = await this.prisma.organization.findUnique({ where: { slug: slug.value } });
      if (!row) return Result.fail(ResultError.notFound(`Organization with slug ${slug.value} not found.`));
      return Result.ok(this.toOrganization(row));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByOwner(ownerId: UserId): Promise<Result<Organization>> {
    try {
      const row = await this.prisma.organization.findFirst({ where: { ownerId: ownerId.value } });
      if (!row) {
        return Result.fail(ResultError.notFound(`Organization owned by user ${ownerId.value} not found.`));
      }
      return Result.ok(this.toOrganization(row));
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async exists(slug: OrganizationSlug): Promise<Result<boolean>> {
    try {
      const count = await this.prisma.organization.count({ where: { slug: slug.value } });
      return Result.ok(count > 0);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async save(org: Organization): Promise<Result<void>> {
    try {
      const snapshot = OrganizationSerializer.serialize(org);
      const currency = (snapshot.settings as any).defaultCurrency || (snapshot.settings as any).currency || "USD";

      await this.prisma.organization.upsert({
        where: { id: snapshot.id },
        create: {
          id: snapshot.id,
          slug: snapshot.slug,
          name: snapshot.name,
          currency,
          ownerId: snapshot.ownerId
        },
        update: {
          slug: snapshot.slug,
          name: snapshot.name,
          currency,
          ownerId: snapshot.ownerId
        }
      });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: OrganizationId): Promise<Result<void>> {
    try {
      await this.prisma.organization.delete({ where: { id: id.value } });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  private toOrganization(row: any): Organization {
    const snapshot = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: "ACTIVE",
      ownerId: row.ownerId,
      taxIdentifier: "US-123456",
      settings: {
        defaultCurrency: row.currency,
        timeZone: "UTC",
        invoiceNumberFormat: "INV-{YYYY}-{NNNN}"
      },
      members: [],
      invitations: [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    return OrganizationHydrator.hydrate(snapshot as any);
  }
}
