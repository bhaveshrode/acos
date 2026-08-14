import { ITokenStore } from "./ITokenStore.js";

/**
 * MemoryTokenStore storing tokens in transient memory.
 */
export class MemoryTokenStore implements ITokenStore {
  private token: string | null = null;

  public saveToken(token: string | null): void {
    this.token = token;
  }

  public retrieveToken(): string | null {
    return this.token;
  }
}
