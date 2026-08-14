import { IUserRepository } from "../../../business/identity/repositories/IUserRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { User } from "../../../business/identity/aggregates/User.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { UserSerializer } from "../../persistence/serializers/UserSerializer.js";
import { UserHydrator } from "../../persistence/hydrators/UserHydrator.js";

/**
 * Concrete infrastructure repository implementing User lifecycle persistence.
 */
export class UserRepository extends BaseRepository implements IUserRepository {
  public async findById(id: UserId): Promise<Result<User>> {
    try {
      const userRow = await (this.prisma as any).user.findUnique({
        where: { id: id.value }
      });
      if (!userRow) {
        return Result.fail(ResultError.notFound(`User with ID ${id.value} not found.`));
      }

      const sessions = await (this.prisma as any).userSession.findMany({
        where: { userId: id.value }
      });
      const loginAttempts = await (this.prisma as any).loginAttempt.findMany({
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

      const aggregate = UserHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByEmail(email: Email): Promise<Result<User>> {
    try {
      const userRow = await (this.prisma as any).user.findUnique({
        where: { email: email.value }
      });
      if (!userRow) {
        return Result.fail(ResultError.notFound(`User with email ${email.value} not found.`));
      }

      const idVal = userRow.id;
      const sessions = await (this.prisma as any).userSession.findMany({ where: { userId: idVal } });
      const loginAttempts = await (this.prisma as any).loginAttempt.findMany({ where: { userId: idVal } });

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

      const aggregate = UserHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async exists(email: Email): Promise<Result<boolean>> {
    try {
      const count = await (this.prisma as any).user.count({
        where: { email: email.value }
      });
      return Result.ok(count > 0);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(user: User): Promise<Result<void>> {
    try {
      const snapshot = UserSerializer.serialize(user);

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
        const txPrisma = txContext.client as any;
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

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: UserId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.userSession.deleteMany({ where: { userId: id.value } });
        await txPrisma.loginAttempt.deleteMany({ where: { userId: id.value } });
        await txPrisma.user.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
