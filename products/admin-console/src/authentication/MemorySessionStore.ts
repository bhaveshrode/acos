import { ISessionStore } from "./ISessionStore.js";
import { UserSession } from "./UserSession.js";

/**
 * MemorySessionStore storing sessions in runtime maps.
 */
export class MemorySessionStore implements ISessionStore {
  private readonly data = new Map<string, UserSession>();

  public save(key: string, session: UserSession): void {
    this.data.set(key, session);
  }

  public load(key: string): UserSession | null {
    return this.data.get(key) || null;
  }

  public clear(key: string): void {
    this.data.delete(key);
  }
}
