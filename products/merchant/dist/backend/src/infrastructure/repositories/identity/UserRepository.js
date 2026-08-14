"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_js_1 = require("../base/BaseRepository.js");
const Result_js_1 = require("../../../foundation/result/Result.js");
const ResultError_js_1 = require("../../../foundation/result/ResultError.js");
const UserSerializer_js_1 = require("../../persistence/serializers/UserSerializer.js");
const UserHydrator_js_1 = require("../../persistence/hydrators/UserHydrator.js");
/**
 * Concrete infrastructure repository implementing User lifecycle persistence.
 */
class UserRepository extends BaseRepository_js_1.BaseRepository {
    async findById(id) {
        try {
            const userRow = await this.prisma.user.findUnique({
                where: { id: id.value }
            });
            if (!userRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`User with ID ${id.value} not found.`));
            }
            const sessions = await this.prisma.userSession.findMany({
                where: { userId: id.value }
            });
            const loginAttempts = await this.prisma.loginAttempt.findMany({
                where: { userId: id.value }
            });
            const snapshot = {
                id: userRow.id,
                email: userRow.email,
                passwordHash: userRow.passwordHash,
                status: userRow.status,
                name: userRow.name,
                verificationToken: userRow.verificationToken
                    ? { token: userRow.verificationToken, expiresAt: userRow.verificationExpiresAt }
                    : null,
                passwordResetToken: userRow.resetToken
                    ? { token: userRow.resetToken, expiresAt: userRow.resetExpiresAt }
                    : null,
                sessions,
                loginAttempts,
                createdAt: userRow.createdAt,
                updatedAt: userRow.updatedAt
            };
            const aggregate = UserHydrator_js_1.UserHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByEmail(email) {
        try {
            const userRow = await this.prisma.user.findUnique({
                where: { email: email.value }
            });
            if (!userRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`User with email ${email.value} not found.`));
            }
            const idVal = userRow.id;
            const sessions = await this.prisma.userSession.findMany({ where: { userId: idVal } });
            const loginAttempts = await this.prisma.loginAttempt.findMany({ where: { userId: idVal } });
            const snapshot = {
                id: userRow.id,
                email: userRow.email,
                passwordHash: userRow.passwordHash,
                status: userRow.status,
                name: userRow.name,
                verificationToken: userRow.verificationToken
                    ? { token: userRow.verificationToken, expiresAt: userRow.verificationExpiresAt }
                    : null,
                passwordResetToken: userRow.resetToken
                    ? { token: userRow.resetToken, expiresAt: userRow.resetExpiresAt }
                    : null,
                sessions,
                loginAttempts,
                createdAt: userRow.createdAt,
                updatedAt: userRow.updatedAt
            };
            const aggregate = UserHydrator_js_1.UserHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async exists(email) {
        try {
            const count = await this.prisma.user.count({
                where: { email: email.value }
            });
            return Result_js_1.Result.ok(count > 0);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async save(user) {
        try {
            const snapshot = UserSerializer_js_1.UserSerializer.serialize(user);
            const userRow = {
                id: snapshot.id,
                email: snapshot.email,
                passwordHash: snapshot.passwordHash,
                status: snapshot.status,
                name: snapshot.name,
                verificationToken: snapshot.verificationToken ? snapshot.verificationToken.token : null,
                verificationExpiresAt: snapshot.verificationToken ? snapshot.verificationToken.expiresAt : null,
                resetToken: snapshot.passwordResetToken ? snapshot.passwordResetToken.token : null,
                resetExpiresAt: snapshot.passwordResetToken ? snapshot.passwordResetToken.expiresAt : null,
                createdAt: snapshot.createdAt,
                updatedAt: snapshot.updatedAt
            };
            const sessions = snapshot.sessions.map((s) => ({
                sessionId: s.sessionId,
                userId: snapshot.id,
                refreshToken: s.refreshToken,
                expiresAt: s.expiresAt,
                status: s.status
            }));
            const loginAttempts = snapshot.loginAttempts.map((l) => ({
                timestamp: l.timestamp,
                userId: snapshot.id,
                ipAddress: l.ipAddress,
                successful: l.successful
            }));
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
                await txPrisma.user.upsert({
                    where: { id: userRow.id },
                    create: userRow,
                    update: userRow
                });
                // Sync sessions
                await txPrisma.userSession.deleteMany({ where: { userId: userRow.id } });
                if (sessions.length > 0) {
                    await txPrisma.userSession.createMany({ data: sessions });
                }
                // Sync login attempts
                await txPrisma.loginAttempt.deleteMany({ where: { userId: userRow.id } });
                if (loginAttempts.length > 0) {
                    await txPrisma.loginAttempt.createMany({ data: loginAttempts });
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
                await txPrisma.userSession.deleteMany({ where: { userId: id.value } });
                await txPrisma.loginAttempt.deleteMany({ where: { userId: id.value } });
                await txPrisma.user.delete({ where: { id: id.value } });
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
}
exports.UserRepository = UserRepository;
