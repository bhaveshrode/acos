import { UserSession } from "./UserSession.js";

/**
 * ISessionStore contract interface defining session data persistence methods.
 */
export interface ISessionStore {
  save(key: string, session: UserSession): void;
  load(key: string): UserSession | null;
  clear(key: string): void;
}
