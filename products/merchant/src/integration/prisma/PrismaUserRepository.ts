import { PrismaClient } from "@prisma/client";
import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { IUserRepository } from "acos-backend/business/identity/repositories/IUserRepository.js";
import { User } from "acos-backend/business/identity/aggregates/User.js";
import { UserId } from "acos-backend/business/identity/value-objects/UserId.js";
import { Email } from "acos-backend/business/identity/value-objects/Email.js";
import { UserSerializer } from "acos-backend/infrastructure/persistence/serializers/UserSerializer.js";
import { PasswordHash } from "acos-backend/business/identity/value-objects/PasswordHash.js";
import { SessionId } from "acos-backend/business/identity/value-objects/SessionId.js";
import { RefreshToken } from "acos-backend/business/identity/value-objects/RefreshToken.js";
import { UserStatus } from "acos-backend/business/identity/enums/UserStatus.js";
import { LoginAttempt } from "acos-backend/business/identity/value-objects/LoginAttempt.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: UserId): Promise<Result<User>> {
    try {
      console.log("[PrismaUserRepository] findById called with ID:", id.value);
      const row = await this.prisma.user.findUnique({ where: { id: id.value } });
      if (!row) {
        console.log("[PrismaUserRepository] findById: User not found in DB for ID:", id.value);
        return Result.fail(ResultError.notFound(`User with ID ${id.value} not found.`));
      }

      const sessionsList = await this.prisma.userSession.findMany({ where: { userId: row.id } });
      const attemptsList = await this.prisma.loginAttempt.findMany({ where: { userId: row.id } });

      const sessionMap = new Map<string, any>();
      for (const s of sessionsList) {
        const refreshTokRes = RefreshToken.create(s.refreshToken, new Date(s.expiresAt));
        if (refreshTokRes.isSuccess) {
          sessionMap.set(s.id, {
            sessionId: new SessionId(s.id),
            refreshToken: refreshTokRes.value,
            expiresAt: new Date(s.expiresAt),
            status: s.status
          });
        }
      }

      const user = User.create(
        new UserId(row.id),
        {
          email: Email.create(row.email).value,
          passwordHash: PasswordHash.create(row.passwordHash).value,
          status: UserStatus.ACTIVE,
          name: row.name,
          verificationToken: null,
          passwordResetToken: null,
          sessions: sessionMap,
          loginAttempts: attemptsList.map(l => LoginAttempt.create(l.timestamp, l.ipAddress, l.successful).value),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        }
      );

      return Result.ok(user);
    } catch (err: any) {
      console.error("[PrismaUserRepository] findById: Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async findByEmail(email: Email): Promise<Result<User>> {
    try {
      console.log("[PrismaUserRepository] findByEmail called with email:", email.value);
      const row = await this.prisma.user.findUnique({ where: { email: email.value } });
      if (!row) {
        console.log("[PrismaUserRepository] findByEmail: User not found in DB for email:", email.value);
        return Result.fail(ResultError.notFound(`User with email ${email.value} not found.`));
      }

      const sessionsList = await this.prisma.userSession.findMany({ where: { userId: row.id } });
      const attemptsList = await this.prisma.loginAttempt.findMany({ where: { userId: row.id } });

      const sessionMap = new Map<string, any>();
      for (const s of sessionsList) {
        const refreshTokRes = RefreshToken.create(s.refreshToken, new Date(s.expiresAt));
        if (refreshTokRes.isSuccess) {
          sessionMap.set(s.id, {
            sessionId: new SessionId(s.id),
            refreshToken: refreshTokRes.value,
            expiresAt: new Date(s.expiresAt),
            status: s.status
          });
        }
      }

      const user = User.create(
        new UserId(row.id),
        {
          email: Email.create(row.email).value,
          passwordHash: PasswordHash.create(row.passwordHash).value,
          status: UserStatus.ACTIVE,
          name: row.name,
          verificationToken: null,
          passwordResetToken: null,
          sessions: sessionMap,
          loginAttempts: attemptsList.map(l => LoginAttempt.create(l.timestamp, l.ipAddress, l.successful).value),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        }
      );

      return Result.ok(user);
    } catch (err: any) {
      console.error("[PrismaUserRepository] findByEmail: Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async exists(email: Email): Promise<Result<boolean>> {
    try {
      const count = await this.prisma.user.count({ where: { email: email.value } });
      return Result.ok(count > 0);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async save(user: User): Promise<Result<void>> {
    try {
      const snapshot = UserSerializer.serialize(user);
      console.log("[PrismaUserRepository] save: upserting user ID:", snapshot.id, "sessions count:", snapshot.sessions.length);

      const mappedSessions = user.sessions.map((s) => ({
        sessionId: s.sessionId.value,
        refreshToken: s.refreshToken.token || (s.refreshToken as any).value || "",
        expiresAt: s.expiresAt,
        status: s.status
      }));

      await this.prisma.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { id: snapshot.id },
          create: {
            id: snapshot.id,
            email: snapshot.email,
            name: snapshot.name,
            passwordHash: snapshot.passwordHash || ""
          },
          update: {
            email: snapshot.email,
            name: snapshot.name,
            passwordHash: snapshot.passwordHash || ""
          }
        });

        // Sync sessions in PostgreSQL
        await tx.userSession.deleteMany({ where: { userId: snapshot.id } });
        if (mappedSessions.length > 0) {
          await tx.userSession.createMany({
            data: mappedSessions.map((s) => ({
              id: s.sessionId,
              userId: snapshot.id,
              refreshToken: s.refreshToken,
              expiresAt: s.expiresAt,
              status: s.status
            }))
          });
        }

        // Sync login attempts in PostgreSQL
        const mappedAttempts = user.loginAttempts.map((l) => ({
          userId: snapshot.id,
          timestamp: l.timestamp,
          ipAddress: l.ipAddress,
          successful: l.successful
        }));
        await tx.loginAttempt.deleteMany({ where: { userId: snapshot.id } });
        if (mappedAttempts.length > 0) {
          await tx.loginAttempt.createMany({ data: mappedAttempts });
        }
      });

      return Result.ok();
    } catch (err: any) {
      console.error("[PrismaUserRepository] save: Unexpected error:", err);
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async delete(id: UserId): Promise<Result<void>> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.userSession.deleteMany({ where: { userId: id.value } });
        await tx.loginAttempt.deleteMany({ where: { userId: id.value } });
        await tx.user.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
