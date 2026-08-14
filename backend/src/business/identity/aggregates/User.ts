import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { UserId } from "../value-objects/UserId.js";
import { Email } from "../value-objects/Email.js";
import { PasswordHash } from "../value-objects/PasswordHash.js";
import { UserStatus } from "../enums/UserStatus.js";
import { SessionId } from "../value-objects/SessionId.js";
import { RefreshToken } from "../value-objects/RefreshToken.js";
import { SessionStatus } from "../enums/SessionStatus.js";
import { VerificationToken } from "../value-objects/VerificationToken.js";
import { PasswordResetToken } from "../value-objects/PasswordResetToken.js";
import { LoginAttempt } from "../value-objects/LoginAttempt.js";
import { IPasswordHasher } from "../../../foundation/contracts/security/IPasswordHasher.js";

// Domain Events
import { UserRegistered } from "../events/UserRegistered.js";
import { EmailVerified } from "../events/EmailVerified.js";
import { UserLoggedIn } from "../events/UserLoggedIn.js";
import { UserLoggedOut } from "../events/UserLoggedOut.js";
import { PasswordChanged } from "../events/PasswordChanged.js";
import { PasswordResetRequested } from "../events/PasswordResetRequested.js";
import { PasswordResetCompleted } from "../events/PasswordResetCompleted.js";
import { UserSuspended } from "../events/UserSuspended.js";
import { UserReactivated } from "../events/UserReactivated.js";
import { UserDeleted } from "../events/UserDeleted.js";

export interface UserSession {
  sessionId: SessionId;
  refreshToken: RefreshToken;
  expiresAt: Date;
  status: SessionStatus;
}

export interface UserProps {
  email: Email;
  passwordHash: PasswordHash;
  status: UserStatus;
  name: string;
  verificationToken: VerificationToken | null;
  passwordResetToken: PasswordResetToken | null;
  loginAttempts: LoginAttempt[];
  sessions: Map<string, UserSession>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root representing a User identity in ACOS.
 * Establishes authentication boundaries and enforces security state transition constraints.
 */
export class User extends AggregateRoot<UserId> {
  private readonly props: UserProps;

  private constructor(id: UserId, props: UserProps) {
    super(id);
    this.props = props;
  }

  /**
   * Creates a User instance in memory.
   */
  public static create(
    id: UserId,
    props: Omit<UserProps, "loginAttempts" | "sessions" | "createdAt" | "updatedAt"> & {
      loginAttempts?: LoginAttempt[];
      sessions?: Map<string, UserSession>;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): User {
    return new User(id, {
      ...props,
      loginAttempts: props.loginAttempts || [],
      sessions: props.sessions || new Map(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    });
  }

  /**
   * Factory constructor to register a new User (initiates verification state).
   */
  public static register(
    id: UserId,
    email: Email,
    passwordHash: PasswordHash,
    name: string,
    token: VerificationToken
  ): Result<User> {
    const user = User.create(id, {
      email,
      passwordHash,
      status: UserStatus.PENDING_VERIFICATION,
      name,
      verificationToken: token,
      passwordResetToken: null
    });

    user.addDomainEvent(new UserRegistered(id.value, email, token));
    return Result.ok(user);
  }

  // Getters
  public get email(): Email { return this.props.email; }
  public get passwordHash(): PasswordHash { return this.props.passwordHash; }
  public get status(): UserStatus { return this.props.status; }
  public get name(): string { return this.props.name; }
  public get verificationToken(): VerificationToken | null { return this.props.verificationToken; }
  public get passwordResetToken(): PasswordResetToken | null { return this.props.passwordResetToken; }
  public get loginAttempts(): readonly LoginAttempt[] { return Object.freeze([...this.props.loginAttempts]); }
  public get sessions(): readonly UserSession[] { return Object.freeze(Array.from(this.props.sessions.values())); }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Verifies the user's email address using a matching validation token.
   */
  public verifyEmail(tokenValue: string): Result<void> {
    if (this.status !== UserStatus.PENDING_VERIFICATION) {
      return Result.fail(ResultError.conflict("User email is already verified."));
    }
    if (!this.verificationToken) {
      return Result.fail(ResultError.notFound("Verification token is missing."));
    }
    if (this.verificationToken.token !== tokenValue) {
      return Result.fail(ResultError.validation("Invalid verification token."));
    }
    if (this.verificationToken.isExpired) {
      return Result.fail(ResultError.validation("Verification token has expired."));
    }

    this.props.status = UserStatus.ACTIVE;
    this.props.verificationToken = null;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new EmailVerified(this.id.value, this.email));
    return Result.ok();
  }

  /**
   * Generates a password recovery request and registers a reset token.
   */
  public initiatePasswordReset(token: PasswordResetToken): Result<void> {
    if (this.status === UserStatus.DELETED) {
      return Result.fail(ResultError.conflict("Cannot reset password for deleted users."));
    }
    this.props.passwordResetToken = token;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PasswordResetRequested(this.id.value, this.email, token));
    return Result.ok();
  }

  /**
   * Completes a password recovery reset by supplying the token and new hash.
   */
  public completePasswordReset(tokenValue: string, newHash: PasswordHash): Result<void> {
    if (!this.passwordResetToken) {
      return Result.fail(ResultError.notFound("Password reset token is missing."));
    }
    if (this.passwordResetToken.token !== tokenValue) {
      return Result.fail(ResultError.validation("Invalid reset token."));
    }
    if (this.passwordResetToken.isExpired) {
      return Result.fail(ResultError.validation("Reset token has expired."));
    }

    this.props.passwordHash = newHash;
    this.props.passwordResetToken = null;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PasswordResetCompleted(this.id.value));
    return Result.ok();
  }

  /**
   * Standard password rotation action. Requires verifying current plaintext password.
   */
  public async changePassword(
    currentPlaintext: string,
    newHash: PasswordHash,
    hasher: IPasswordHasher
  ): Promise<Result<void>> {
    if (this.status !== UserStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Password changes are only allowed for active users."));
    }
    const isCorrect = await this.passwordHash.compare(currentPlaintext, hasher);
    if (!isCorrect) {
      return Result.fail(ResultError.validation("Incorrect current password."));
    }

    this.props.passwordHash = newHash;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PasswordChanged(this.id.value));
    return Result.ok();
  }

  /**
   * Spawns a new active authenticated session.
   */
  public createSession(
    sessionId: SessionId,
    refreshToken: RefreshToken,
    expiresAt: Date
  ): Result<UserSession> {
    if (this.status !== UserStatus.ACTIVE) {
      return Result.fail(ResultError.conflict(`Authentication blocked. Account is in ${this.status} state.`));
    }

    const session: UserSession = {
      sessionId,
      refreshToken,
      expiresAt,
      status: SessionStatus.ACTIVE
    };

    this.props.sessions.set(sessionId.value, session);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserLoggedIn(this.id.value, sessionId));
    return Result.ok(session);
  }

  /**
   * Terminates/revokes an active user session.
   */
  public terminateSession(sessionId: SessionId): Result<void> {
    const session = this.props.sessions.get(sessionId.value);
    if (!session) {
      return Result.fail(ResultError.notFound("Session not found."));
    }

    session.status = SessionStatus.REVOKED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserLoggedOut(this.id.value, sessionId));
    return Result.ok();
  }

  /**
   * Tracks authentication attempts. Suspends active account if consecutive failures exceed 5.
   */
  public recordLoginAttempt(attempt: LoginAttempt): Result<void> {
    if (this.status === UserStatus.DELETED) {
      return Result.fail(ResultError.conflict("User is deleted."));
    }
    this.props.loginAttempts.push(attempt);
    this.props.updatedAt = new Date();

    if (!attempt.successful) {
      const consecutiveFailures = this.countConsecutiveFailures();
      if (consecutiveFailures >= 5 && this.status === UserStatus.ACTIVE) {
        this.props.status = UserStatus.SUSPENDED;
        this.addDomainEvent(new UserSuspended(this.id.value, "Too many consecutive failed login attempts."));
      }
    }

    return Result.ok();
  }

  private countConsecutiveFailures(): number {
    const sorted = [...this.props.loginAttempts].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    let count = 0;
    for (const attempt of sorted) {
      if (!attempt.successful) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Reactivates locked out or disabled accounts.
   */
  public reactivate(): Result<void> {
    if (this.status === UserStatus.DELETED) {
      return Result.fail(ResultError.conflict("Cannot reactivate a permanently deleted user."));
    }
    if (this.status === UserStatus.ACTIVE) {
      return Result.ok();
    }

    this.props.status = UserStatus.ACTIVE;
    this.props.loginAttempts = []; // Clear consecutive lockout history
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserReactivated(this.id.value));
    return Result.ok();
  }

  /**
   * Administrative suspension block.
   */
  public suspend(reason: string): Result<void> {
    if (this.status !== UserStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Only active accounts can be suspended."));
    }
    this.props.status = UserStatus.SUSPENDED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserSuspended(this.id.value, reason));
    return Result.ok();
  }

  /**
   * Administrative account disabler. Revokes all active sessions.
   */
  public disable(): Result<void> {
    if (this.status === UserStatus.DELETED) {
      return Result.fail(ResultError.conflict("Cannot disable a deleted account."));
    }
    this.props.status = UserStatus.DISABLED;
    this.props.sessions.forEach((s) => {
      s.status = SessionStatus.REVOKED;
    });
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  /**
   * Deletes user account permanently. Revokes all active sessions.
   */
  public delete(): Result<void> {
    if (this.status === UserStatus.DELETED) {
      return Result.ok();
    }
    this.props.status = UserStatus.DELETED;
    this.props.sessions.forEach((s) => {
      s.status = SessionStatus.REVOKED;
    });
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserDeleted(this.id.value));
    return Result.ok();
  }
}
