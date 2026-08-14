import { ISecretProvider } from "./ISecretProvider.js";
import { SecretKey } from "./SecretKey.js";

/**
 * VaultProvider implementing ISecretProvider using HashiCorp Vault semantics.
 */
export class VaultProvider implements ISecretProvider {
  private readonly store = new Map<string, SecretKey>();

  public async getSecret(id: string): Promise<SecretKey | undefined> {
    return this.store.get(id);
  }

  public async storeSecret(secret: SecretKey): Promise<void> {
    this.store.set(secret.id, secret);
  }
}
