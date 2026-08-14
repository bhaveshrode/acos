import { SecretKey } from "./SecretKey.js";
import { ISecretProvider } from "./ISecretProvider.js";

/**
 * SecretsManager managing key retrievals delegating calls to providers.
 */
export class SecretsManager {
  constructor(private readonly provider: ISecretProvider) {}

  public async storeSecret(secret: SecretKey): Promise<void> {
    await this.provider.storeSecret(secret);
  }

  public async getSecret(id: string): Promise<SecretKey | undefined> {
    return await this.provider.getSecret(id);
  }
}
