import { SecretKey } from "./SecretKey.js";

/**
 * ISecretProvider interface declaring standard secrets retrieval.
 */
export interface ISecretProvider {
  getSecret(id: string): Promise<SecretKey | undefined>;
  storeSecret(secret: SecretKey): Promise<void>;
}
