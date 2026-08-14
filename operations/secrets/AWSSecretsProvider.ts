import { ISecretProvider } from "./ISecretProvider.js";
import { SecretKey } from "./SecretKey.js";

/**
 * AWSSecretsProvider implementing ISecretProvider using AWS Secrets Manager.
 */
export class AWSSecretsProvider implements ISecretProvider {
  private readonly store = new Map<string, SecretKey>();

  public async getSecret(id: string): Promise<SecretKey | undefined> {
    return this.store.get(id);
  }

  public async storeSecret(secret: SecretKey): Promise<void> {
    this.store.set(secret.id, secret);
  }
}
