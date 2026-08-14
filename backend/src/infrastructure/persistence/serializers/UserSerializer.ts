import { User } from "../../../business/identity/aggregates/User.js";
import { UserSnapshot } from "../snapshots/UserSnapshot.js";

/**
 * Serializes User aggregate root into flattened UserSnapshot models.
 */
export class UserSerializer {
  public static serialize(aggregate: User): UserSnapshot {
    return {
      id: aggregate.id.value,
      email: aggregate.email.value,
      passwordHash: aggregate.passwordHash.value,
      status: aggregate.status,
      name: aggregate.name,
      verificationToken: aggregate.verificationToken
        ? {
            token: aggregate.verificationToken.token,
            expiresAt: aggregate.verificationToken.expiresAt
          }
        : null,
      passwordResetToken: aggregate.passwordResetToken
        ? {
            token: aggregate.passwordResetToken.token,
            expiresAt: aggregate.passwordResetToken.expiresAt
          }
        : null,
      loginAttempts: aggregate.loginAttempts.map((attempt) => ({
        ipAddress: attempt.ipAddress,
        timestamp: attempt.timestamp,
        successful: attempt.successful
      })),
      sessions: aggregate.sessions.map((session) => ({
        sessionId: session.sessionId.value,
        refreshToken: session.refreshToken.token,
        expiresAt: session.expiresAt,
        status: session.status
      })),
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
