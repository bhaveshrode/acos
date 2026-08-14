import { ProviderConnection } from "./ProviderConnection.js";

/**
 * ProviderConnectionManager cataloging active provider connection instances.
 */
export class ProviderConnectionManager {
  private readonly connections = new Map<string, ProviderConnection>();

  public register(connection: ProviderConnection): void {
    this.connections.set(connection.providerName.toLowerCase(), connection);
  }

  public getConnection(provider: string): ProviderConnection | undefined {
    return this.connections.get(provider.toLowerCase());
  }

  public list(): ProviderConnection[] {
    return Array.from(this.connections.values());
  }

  public clear(): void {
    this.connections.clear();
  }
}
