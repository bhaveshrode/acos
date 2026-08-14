import { PrismaClient } from "@prisma/client";
import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { IOrganizationRepository } from "acos-backend/business/organization/repositories/IOrganizationRepository.js";
import { Organization } from "acos-backend/business/organization/aggregates/Organization.js";
import { OrganizationId } from "acos-backend/business/organization/value-objects/OrganizationId.js";
import { OrganizationSlug } from "acos-backend/business/organization/value-objects/OrganizationSlug.js";
import { OrganizationSerializer } from "acos-backend/infrastructure/persistence/serializers/OrganizationSerializer.js";
import { OrganizationHydrator } from "acos-backend/infrastructure/persistence/hydrators/OrganizationHydrator.js";

export class PrismaOrganizationRepository implements IOrganizationRepository {
  public static readonly ownerMap = new Map<string, string>(); // userId -> orgId

  constructor(private prisma: PrismaClient) {}

  public async findById(id: OrganizationId): Promise<Result<Organization>> {
    try {
      console.error("[PrismaOrganizationRepository] findById called with ID:", id.value);
      const row = await this.prisma.organization.findUnique({ where: { id: id.value } });
      if (!row) return Result.fail(ResultError.notFound(`Organization with ID ${id.value} not found.`));

      // Find ownerId from ownerMap
      let ownerId = "";
      for (const [uId, oId] of PrismaOrganizationRepository.ownerMap.entries()) {
        if (oId === row.id) {
          ownerId = uId;
          break;
        }
      }
      console.error("[PrismaOrganizationRepository] findById resolved ownerId:", ownerId, "for orgId:", row.id, "ownerMap:", Array.from(PrismaOrganizationRepository.ownerMap.entries()));

      const snapshot = {
        id: row.id,
        slug: row.slug,
        name: row.name,
        status: "ACTIVE",
        ownerId,
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

      return Result.ok(OrganizationHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      console.error("[PrismaOrganizationRepository] findById Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findBySlug(slug: OrganizationSlug): Promise<Result<Organization>> {
    try {
      console.error("[PrismaOrganizationRepository] findBySlug called with slug:", slug.value);
      const row = await this.prisma.organization.findUnique({ where: { slug: slug.value } });
      if (!row) return Result.fail(ResultError.notFound(`Organization with slug ${slug.value} not found.`));

      // Find ownerId from ownerMap
      let ownerId = "";
      for (const [uId, oId] of PrismaOrganizationRepository.ownerMap.entries()) {
        if (oId === row.id) {
          ownerId = uId;
          break;
        }
      }
      console.error("[PrismaOrganizationRepository] findBySlug resolved ownerId:", ownerId, "for slug:", slug.value, "ownerMap:", Array.from(PrismaOrganizationRepository.ownerMap.entries()));

      const snapshot = {
        id: row.id,
        slug: row.slug,
        name: row.name,
        status: "ACTIVE",
        ownerId,
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

      return Result.ok(OrganizationHydrator.hydrate(snapshot as any));
    } catch (err: any) {
      console.error("[PrismaOrganizationRepository] findBySlug Unexpected error:", err);
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

      console.error("[PrismaOrganizationRepository] save: saving org ID:", snapshot.id, "ownerId:", snapshot.ownerId);

      // Save owner mapping in-memory
      if (snapshot.ownerId) {
        PrismaOrganizationRepository.ownerMap.set(snapshot.ownerId, snapshot.id);
        console.error("[PrismaOrganizationRepository] save ownerMap updated:", Array.from(PrismaOrganizationRepository.ownerMap.entries()));
      }

      await this.prisma.organization.upsert({
        where: { id: snapshot.id },
        create: {
          id: snapshot.id,
          slug: snapshot.slug,
          name: snapshot.name,
          currency
        },
        update: {
          slug: snapshot.slug,
          name: snapshot.name,
          currency
        }
      });
      return Result.ok();
    } catch (err: any) {
      console.error("[PrismaOrganizationRepository] save Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: OrganizationId): Promise<Result<void>> {
    try {
      await this.prisma.organization.delete({ where: { id: id.value } });
      
      // Clean ownerMap
      for (const [uId, oId] of PrismaOrganizationRepository.ownerMap.entries()) {
        if (oId === id.value) {
          PrismaOrganizationRepository.ownerMap.delete(uId);
        }
      }
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
