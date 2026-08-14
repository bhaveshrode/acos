import { ITokenProvider } from "./TokenProvider.js";
import { ITokenStore } from "./ITokenStore.js";

/**
 * TokenProvider fetching token strings from the injected ITokenStore.
 */
export class TokenProvider implements ITokenProvider {
  constructor(private readonly store: ITokenStore) {}

  public getToken(): string | null {
    return this.store.retrieveToken();
  }

  public setToken(token: string): void {
    this.store.saveToken(token);
  }

  public clearToken(): void {
    this.store.saveToken(null);
  }
}
