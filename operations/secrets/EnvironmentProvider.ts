import { ISecretProvider } from "./ISecretProvider.js";
import { SecretKey } from "./SecretKey.js";

/**
 * EnvironmentProvider implementing ISecretProvider using process env variables.
 */
export class EnvironmentProvider implements ISecretProvider {
  private readonly store = new Map<string, SecretKey>();

  public async getSecret(id: string): Promise<SecretKey | undefined> {
    return this.store.get(id);
  }

  public async storeSecret(secret: SecretKey): Promise<void> {
    this.store.set(secret.id, secret);
  }
}
