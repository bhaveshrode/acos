import { UserSession } from "./UserSession.js";

/**
 * AuthenticationEventType representing categories of authentication occurrences.
 */
export type AuthenticationEventType = "login" | "logout" | "refresh" | "expired";

/**
 * AuthenticationEvent enclosing timestamps and session details.
 */
export class AuthenticationEvent {
  constructor(
    public readonly type: AuthenticationEventType,
    public readonly timestamp: number = Date.now(),
    public readonly session?: UserSession
  ) {
    Object.freeze(this);
  }
}
