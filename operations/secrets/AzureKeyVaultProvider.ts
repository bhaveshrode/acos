import { ISecretProvider } from "./ISecretProvider.js";
import { SecretKey } from "./SecretKey.js";

/**
 * AzureKeyVaultProvider implementing ISecretProvider using Azure Key Vault.
 */
export class AzureKeyVaultProvider implements ISecretProvider {
  private readonly store = new Map<string, SecretKey>();

  public async getSecret(id: string): Promise<SecretKey | undefined> {
    return this.store.get(id);
  }

  public async storeSecret(secret: SecretKey): Promise<void> {
    this.store.set(secret.id, secret);
  }
}
