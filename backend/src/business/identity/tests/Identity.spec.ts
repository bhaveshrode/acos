import { describe, it, expect, vi } from "vitest";
import { UserId } from "../value-objects/UserId.js";
import { Email } from "../value-objects/Email.js";
import { PasswordHash } from "../value-objects/PasswordHash.js";
import { UserStatus } from "../enums/UserStatus.js";
import { User, UserSession } from "../aggregates/User.js";
import { VerificationToken } from "../value-objects/VerificationToken.js";
import { PasswordResetToken } from "../value-objects/PasswordResetToken.js";
import { LoginAttempt } from "../value-objects/LoginAttempt.js";
import { PasswordPolicy } from "../services/PasswordPolicy.js";
import { EmailVerificationPolicy } from "../services/EmailVerificationPolicy.js";
import { AuthenticationService } from "../services/AuthenticationService.js";
import { IPasswordHasher } from "../../../foundation/contracts/security/IPasswordHasher.js";
import { Result } from "../../../foundation/result/Result.js";

// Mock Password Hasher for unit testing
class MockPasswordHasher implements IPasswordHasher {
  public async hash(password: string): Promise<Result<string>> {
    return Result.ok(`hashed_${password}`);
  }

  public async compare(password: string, hash: string): Promise<Result<boolean>> {
    return Result.ok(hash === `hashed_${password}`);
  }
}

describe("Identity Module Unit Tests (Tasks 11.2 - 11.4)", () => {
  const hasher = new MockPasswordHasher();

  describe("Value Objects", () => {
    it("should generate and validate UserId", () => {
      const id = UserId.generate();
      expect(id.value).toBeDefined();
      expect(id.value.length).toBe(36); // UUID length
    });

    it("should normalize and validate Email", () => {
      const emailRes = Email.create("  User@ACOS.IO  ");
      expect(emailRes.isSuccess).toBe(true);
      expect(emailRes.value.value).toBe("user@acos.io");

      const badEmail = Email.create("invalid-email");
      expect(badEmail.isFailure).toBe(true);
    });

    it("should compare PasswordHash correctly", async () => {
      const hash = PasswordHash.create("hashed_securePass1!").value;
      expect(await hash.compare("securePass1!", hasher)).toBe(true);
      expect(await hash.compare("wrongPass", hasher)).toBe(false);
    });
  });

  describe("PasswordPolicy", () => {
    const policy = new PasswordPolicy(8);

    it("should validate complex passwords", () => {
      expect(policy.validate("SecureP@ss123").isSuccess).toBe(true);
    });

    it("should reject simple or short passwords", () => {
      expect(policy.validate("short").isFailure).toBe(true);
      expect(policy.validate("no_caps_123!").isFailure).toBe(true);
      expect(policy.validate("NOLOWERCASE123!").isFailure).toBe(true);
    });
  });

  describe("EmailVerificationPolicy", () => {
    const policy = new EmailVerificationPolicy(24, ["mailinator.com", "tempmail.org"]);

    it("should block specified email domains", () => {
      expect(policy.validateEmailDomain("alice@acos.io").isSuccess).toBe(true);
      expect(policy.validateEmailDomain("bob@mailinator.com").isFailure).toBe(true);
    });
  });

  describe("User Aggregate Root", () => {
    const userId = UserId.generate();
    const email = Email.create("alice@acos.io").value;
    const passwordHash = PasswordHash.create("hashed_alicePass").value;
    const verificationToken = VerificationToken.create("token123", new Date(Date.now() + 10000)).value;

    it("should register a user in PENDING_VERIFICATION state", () => {
      const user = User.register(userId, email, passwordHash, "Alice", verificationToken).value;

      expect(user.status).toBe(UserStatus.PENDING_VERIFICATION);
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0].eventName).toBe("UserRegistered");
    });

    it("should verify email and transition to ACTIVE", () => {
      const user = User.register(userId, email, passwordHash, "Alice", verificationToken).value;
      user.clearDomainEvents();

      const verifyRes = user.verifyEmail("token123");
      expect(verifyRes.isSuccess).toBe(true);
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.verificationToken).toBeNull();
      
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0].eventName).toBe("EmailVerified");
    });

    it("should lock account after 5 consecutive failed login attempts", () => {
      const user = User.create(userId, {
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
        name: "Alice",
        verificationToken: null,
        passwordResetToken: null
      });

      // Execute 4 failed attempts
      for (let i = 0; i < 4; i++) {
        const attempt = LoginAttempt.create(new Date(), "127.0.0.1", false).value;
        user.recordLoginAttempt(attempt);
        expect(user.status).toBe(UserStatus.ACTIVE);
      }

      // 5th failed attempt locks the account
      const finalAttempt = LoginAttempt.create(new Date(), "127.0.0.1", false).value;
      user.recordLoginAttempt(finalAttempt);

      expect(user.status).toBe(UserStatus.SUSPENDED);
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0].eventName).toBe("UserSuspended");
    });

    it("should clear lockout count and unlock on reactivation", () => {
      const user = User.create(userId, {
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
        name: "Alice",
        verificationToken: null,
        passwordResetToken: null
      });

      // Lock account
      for (let i = 0; i < 5; i++) {
        user.recordLoginAttempt(LoginAttempt.create(new Date(), "127.0.0.1", false).value);
      }
      expect(user.status).toBe(UserStatus.SUSPENDED);
      user.clearDomainEvents();

      // Reactivate
      const reactivateRes = user.reactivate();
      expect(reactivateRes.isSuccess).toBe(true);
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.loginAttempts).toHaveLength(0);
      expect(user.domainEvents[0].eventName).toBe("UserReactivated");
    });
  });

  describe("AuthenticationService", () => {
    const authService = new AuthenticationService(hasher, 1, 2);

    it("should successfully authenticate active users and generate session", async () => {
      const userId = UserId.generate();
      const email = Email.create("alice@acos.io").value;
      const passwordHash = PasswordHash.create("hashed_securePass1!").value;
      const user = User.create(userId, {
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
        name: "Alice",
        verificationToken: null,
        passwordResetToken: null
      });

      const authRes = await authService.authenticate(user, "securePass1!", "192.168.1.10", () => "refreshtoken123");
      
      expect(authRes.isSuccess).toBe(true);
      expect(authRes.value.status).toBe("ACTIVE");
      expect(user.sessions).toHaveLength(1);
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0].eventName).toBe("UserLoggedIn");
    });

    it("should reject authentication with invalid passwords", async () => {
      const userId = UserId.generate();
      const email = Email.create("alice@acos.io").value;
      const passwordHash = PasswordHash.create("hashed_securePass1!").value;
      const user = User.create(userId, {
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
        name: "Alice",
        verificationToken: null,
        passwordResetToken: null
      });

      const authRes = await authService.authenticate(user, "wrongPlain", "192.168.1.10", () => "refreshtoken123");
      expect(authRes.isFailure).toBe(true);
      expect(authRes.error.code).toBe("UNAUTHORIZED");
    });
  });
});
