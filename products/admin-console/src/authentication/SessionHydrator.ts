import { ISessionStore } from "./ISessionStore.js";
import { SessionManager } from "./SessionManager.js";

/**
 * SessionHydrator restoring saved sessions during startup bootstraps.
 */
export class SessionHydrator {
  constructor(private readonly sessionStore: ISessionStore) {}

  public hydrate(key: string, manager: SessionManager): boolean {
    try {
      const session = this.sessionStore.load(key);
      if (session && !session.isExpired()) {
        manager.setSession(session);
        return true;
      }
    } catch {
      this.sessionStore.clear(key);
    }
    return false;
  }
}
