import { ISessionStore } from "./ISessionStore.js";
import { UserSession } from "./UserSession.js";

/**
 * LocalStorageSessionStore persisting user sessions across browser sessions.
 */
export class LocalStorageSessionStore implements ISessionStore {
  public save(key: string, session: UserSession): void {
    if (typeof localStorage !== "undefined") {
      const serialized = JSON.stringify({
        userId: session.userId,
        username: session.username,
        token: session.token,
        claims: session.claims,
        expirationTime: session.expirationTime,
        refreshToken: session.refreshToken
      });
      localStorage.setItem(key, serialized);
    }
  }

  public load(key: string): UserSession | null {
    if (typeof localStorage !== "undefined") {
      const data = localStorage.getItem(key);
      if (!data) return null;
      try {
        const p = JSON.parse(data);
        return new UserSession(
          p.userId,
          p.username,
          p.token,
          p.claims,
          p.expirationTime,
          p.refreshToken
        );
      } catch {
        return null;
      }
    }
    return null;
  }

  public clear(key: string): void {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  }
}
