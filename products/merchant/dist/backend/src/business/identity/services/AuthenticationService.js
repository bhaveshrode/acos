import { LoginAttempt } from "../value-objects/LoginAttempt.js";
import { SessionId } from "../value-objects/SessionId.js";
import { RefreshToken } from "../value-objects/RefreshToken.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Domain Service responsible for authenticating users, generating login attempt records,
 * and orchestrating session generation inside the aggregate root.
 */
export class AuthenticationService {
    passwordHasher;
    sessionLifespanHours;
    refreshLifespanDays;
    constructor(passwordHasher, sessionLifespanHours = 2, refreshLifespanDays = 7) {
        this.passwordHasher = passwordHasher;
        this.sessionLifespanHours = sessionLifespanHours;
        this.refreshLifespanDays = refreshLifespanDays;
    }
    /**
     * Authenticates a user by validating their password plaintext, logging attempts, and issuing active sessions.
     * @param user The User aggregate root.
     * @param plaintext The plain text password.
     * @param ipAddress The IP address of the logging client.
     * @param generateTokenString Callback to generate a unique random token string.
     */
    async authenticate(user, plaintext, ipAddress, generateTokenString) {
        // Block authentication for non-active states immediately
        if (user.status !== "ACTIVE" && user.status !== "SUSPENDED") {
            const attempt = LoginAttempt.create(new Date(), ipAddress, false).value;
            user.recordLoginAttempt(attempt);
            return Result.fail(ResultError.unauthorized(`Authentication blocked. Account is ${user.status}.`));
        }
        // Hash check
        const isMatch = await user.passwordHash.compare(plaintext, this.passwordHasher);
        // Record login attempts
        const attempt = LoginAttempt.create(new Date(), ipAddress, isMatch).value;
        user.recordLoginAttempt(attempt);
        if (!isMatch) {
            return Result.fail(ResultError.unauthorized("Authentication failed. Invalid credentials."));
        }
        // Prevent login if consecutive attempts triggered a suspension lockout
        if (user.status === "SUSPENDED") {
            return Result.fail(ResultError.unauthorized("Authentication failed. Account has been suspended due to consecutive failed attempts."));
        }
        // Issue active session
        const sessionId = SessionId.generate();
        const refreshExpiresAt = new Date(Date.now() + this.refreshLifespanDays * 24 * 60 * 60 * 1000);
        const refreshTokenRes = RefreshToken.create(generateTokenString(), refreshExpiresAt);
        if (refreshTokenRes.isFailure) {
            return Result.fail(refreshTokenRes.error);
        }
        const sessionExpiresAt = new Date(Date.now() + this.sessionLifespanHours * 60 * 60 * 1000);
        return user.createSession(sessionId, refreshTokenRes.value, sessionExpiresAt);
    }
}
