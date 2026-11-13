import { Result } from "../../../foundation/result/Result.js";
import { User } from "../aggregates/User.js";
import { SessionId } from "../value-objects/SessionId.js";

/**
 * Revokes an active session and records the logout on the user.
 */
export function terminateUserSession(user: User, sessionId: SessionId): Result<void> {
  return user.terminateSession(sessionId);
}
