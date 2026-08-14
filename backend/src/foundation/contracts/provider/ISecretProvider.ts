import { Result } from "../../result/Result.js";

/**
 * Interface representing external secret lookup integrations (e.g. HashiCorp Vault, AWS Secrets Manager).
 */
export interface ISecretProvider {
  /**
   * Retrieves a decrypted credentials secret value by key name.
   */
  getSecret(secretName: string): Promise<Result<string>>;
}
