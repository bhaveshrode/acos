"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const BaseRepository_js_1 = require("../base/BaseRepository.js");
const Result_js_1 = require("../../../foundation/result/Result.js");
const ResultError_js_1 = require("../../../foundation/result/ResultError.js");
const OrganizationSerializer_js_1 = require("../../persistence/serializers/OrganizationSerializer.js");
const OrganizationHydrator_js_1 = require("../../persistence/hydrators/OrganizationHydrator.js");
/**
 * Concrete infrastructure repository implementing Organization lifecycle persistence.
 */
class OrganizationRepository extends BaseRepository_js_1.BaseRepository {
    async findById(id) {
        try {
            const orgRow = await this.prisma.organization.findUnique({
                where: { id: id.value }
            });
            if (!orgRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Organization with ID ${id.value} not found.`));
            }
            const members = await this.prisma.organizationMember.findMany({
                where: { organizationId: id.value }
            });
            const invitations = await this.prisma.organizationInvitation.findMany({
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
            const aggregate = OrganizationHydrator_js_1.OrganizationHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findBySlug(slug) {
        try {
            const orgRow = await this.prisma.organization.findUnique({
                where: { slug: slug.value }
            });
            if (!orgRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Organization with slug ${slug.value} not found.`));
            }
            const idVal = orgRow.id;
            const members = await this.prisma.organizationMember.findMany({ where: { organizationId: idVal } });
            const invitations = await this.prisma.organizationInvitation.findMany({ where: { organizationId: idVal } });
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
            const aggregate = OrganizationHydrator_js_1.OrganizationHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async exists(slug) {
        try {
            const count = await this.prisma.organization.count({
                where: { slug: slug.value }
            });
            return Result_js_1.Result.ok(count > 0);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async save(org) {
        try {
            const snapshot = OrganizationSerializer_js_1.OrganizationSerializer.serialize(org);
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
                const txPrisma = txContext.client;
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
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async delete(id) {
        try {
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
                await txPrisma.organizationMember.deleteMany({ where: { organizationId: id.value } });
                await txPrisma.organizationInvitation.deleteMany({ where: { organizationId: id.value } });
                await txPrisma.organization.delete({ where: { id: id.value } });
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
}
exports.OrganizationRepository = OrganizationRepository;
