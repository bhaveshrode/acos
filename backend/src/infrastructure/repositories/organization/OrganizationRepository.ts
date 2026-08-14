import { IOrganizationRepository } from "../../../business/organization/repositories/IOrganizationRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Organization } from "../../../business/organization/aggregates/Organization.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { OrganizationSlug } from "../../../business/organization/value-objects/OrganizationSlug.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { OrganizationSerializer } from "../../persistence/serializers/OrganizationSerializer.js";
import { OrganizationHydrator } from "../../persistence/hydrators/OrganizationHydrator.js";

/**
 * Concrete infrastructure repository implementing Organization lifecycle persistence.
 */
export class OrganizationRepository extends BaseRepository implements IOrganizationRepository {
  public async findById(id: OrganizationId): Promise<Result<Organization>> {
    try {
      const orgRow = await (this.prisma as any).organization.findUnique({
        where: { id: id.value }
      });
      if (!orgRow) {
        return Result.fail(ResultError.notFound(`Organization with ID ${id.value} not found.`));
      }

      const members = await (this.prisma as any).organizationMember.findMany({
        where: { organizationId: id.value }
      });
      const invitations = await (this.prisma as any).organizationInvitation.findMany({
        where: { organizationId: id.value }
      });

      const snapshot = {
        id: orgRow.id,
        slug: orgRow.slug,
        name: orgRow.name,
        taxIdentifier: orgRow.taxIdentifier,
        settings: {
          currency: orgRow.currency,
          timeZone: orgRow.timeZone,
          fiscalYearStartMonth: orgRow.fiscalYearStartMonth
        },
        members,
        invitations,
        createdAt: orgRow.createdAt,
        updatedAt: orgRow.updatedAt
      };

      const aggregate = OrganizationHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findBySlug(slug: OrganizationSlug): Promise<Result<Organization>> {
    try {
      const orgRow = await (this.prisma as any).organization.findUnique({
        where: { slug: slug.value }
      });
      if (!orgRow) {
        return Result.fail(ResultError.notFound(`Organization with slug ${slug.value} not found.`));
      }

      const idVal = orgRow.id;
      const members = await (this.prisma as any).organizationMember.findMany({ where: { organizationId: idVal } });
      const invitations = await (this.prisma as any).organizationInvitation.findMany({ where: { organizationId: idVal } });

      const snapshot = {
        id: orgRow.id,
        slug: orgRow.slug,
        name: orgRow.name,
        taxIdentifier: orgRow.taxIdentifier,
        settings: {
          currency: orgRow.currency,
          timeZone: orgRow.timeZone,
          fiscalYearStartMonth: orgRow.fiscalYearStartMonth
        },
        members,
        invitations,
        createdAt: orgRow.createdAt,
        updatedAt: orgRow.updatedAt
      };

      const aggregate = OrganizationHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async exists(slug: OrganizationSlug): Promise<Result<boolean>> {
    try {
      const count = await (this.prisma as any).organization.count({
        where: { slug: slug.value }
      });
      return Result.ok(count > 0);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(org: Organization): Promise<Result<void>> {
    try {
      const snapshot = OrganizationSerializer.serialize(org);

      const orgRow = {
        id: snapshot.id,
        slug: snapshot.slug,
        name: snapshot.name,
        taxIdentifier: snapshot.taxIdentifier,
        currency: snapshot.settings.currency,
        timeZone: snapshot.settings.timeZone,
        fiscalYearStartMonth: snapshot.settings.fiscalYearStartMonth,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt
      };

      const members = snapshot.members.map((m) => ({
        organizationId: snapshot.id,
        userId: m.userId,
        email: m.email,
        role: m.role,
        joinedAt: m.joinedAt
      }));

      const invitations = snapshot.invitations.map((i) => ({
        id: i.id,
        organizationId: snapshot.id,
        email: i.email,
        role: i.role,
        token: i.token,
        status: i.status,
        expiresAt: i.expiresAt,
        invitedBy: i.invitedBy,
        createdAt: i.createdAt
      }));

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.organization.upsert({
          where: { id: orgRow.id },
          create: orgRow,
          update: orgRow
        });

        // Sync members
        await txPrisma.organizationMember.deleteMany({ where: { organizationId: orgRow.id } });
        if (members.length > 0) {
          await txPrisma.organizationMember.createMany({ data: members });
        }

        // Sync invitations
        await txPrisma.organizationInvitation.deleteMany({ where: { organizationId: orgRow.id } });
        if (invitations.length > 0) {
          await txPrisma.organizationInvitation.createMany({ data: invitations });
        }
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: OrganizationId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.organizationMember.deleteMany({ where: { organizationId: id.value } });
        await txPrisma.organizationInvitation.deleteMany({ where: { organizationId: id.value } });
        await txPrisma.organization.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
