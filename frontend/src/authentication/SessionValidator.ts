import { UserSession } from "./UserSession.js";

/**
 * SessionValidator verifying token structures and sessions duration expirations.
 */
export class SessionValidator {
  public validate(session: UserSession | undefined): boolean {
    if (!session) return false;
    if (!session.token || !session.userId || !session.username) return false;
    return !session.isExpired();
  }
}
