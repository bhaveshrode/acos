/**
 * ITokenStore contract interface representing credentials tokens persistence stores.
 */
export interface ITokenStore {
  saveToken(token: string | null): void;
  retrieveToken(): string | null;
}
