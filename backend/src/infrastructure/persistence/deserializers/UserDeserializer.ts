import { UserSnapshot } from "../snapshots/UserSnapshot.js";
import { UserProps, UserSession } from "../../../business/identity/aggregates/User.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { PasswordHash } from "../../../business/identity/value-objects/PasswordHash.js";
import { UserStatus } from "../../../business/identity/enums/UserStatus.js";
import { VerificationToken } from "../../../business/identity/value-objects/VerificationToken.js";
import { PasswordResetToken } from "../../../business/identity/value-objects/PasswordResetToken.js";
import { LoginAttempt } from "../../../business/identity/value-objects/LoginAttempt.js";
import { SessionId } from "../../../business/identity/value-objects/SessionId.js";
import { RefreshToken } from "../../../business/identity/value-objects/RefreshToken.js";
import { SessionStatus } from "../../../business/identity/enums/SessionStatus.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs UserProps domain structure from UserSnapshot persistence models.
 */
export class UserDeserializer {
  public static deserialize(snapshot: UserSnapshot): UserProps {
    const sessions = new Map<string, UserSession>();
    for (const sess of snapshot.sessions) {
      sessions.set(sess.sessionId, {
        sessionId: new SessionId(new UniqueEntityID(sess.sessionId)),
        refreshToken: RefreshToken.create(sess.refreshToken).value,
        expiresAt: sess.expiresAt,
        status: sess.status as SessionStatus
      });
    }

    const loginAttempts = snapshot.loginAttempts.map((att) =>
      LoginAttempt.create(att.timestamp, att.ipAddress, att.successful).value
    );

    return {
      email: Email.create(snapshot.email).value,
      passwordHash: PasswordHash.create(snapshot.passwordHash).value,
      status: snapshot.status as UserStatus,
      name: snapshot.name,
      verificationToken: snapshot.verificationToken
        ? VerificationToken.create(
            snapshot.verificationToken.token,
            snapshot.verificationToken.expiresAt
          ).value
        : null,
      passwordResetToken: snapshot.passwordResetToken
        ? PasswordResetToken.create(
            snapshot.passwordResetToken.token,
            snapshot.passwordResetToken.expiresAt
          ).value
        : null,
      loginAttempts,
      sessions,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
