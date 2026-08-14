/**
 * Interface representing secret credential stores.
 */
export interface ISecretProvider {
  /**
   * Retrieves a secret token/credential value by key.
   */
  getSecret(key: string): Promise<string>;
}

/**
 * Secret provider resolving keys using process environment configurations.
 */
export class EnvironmentSecretProvider implements ISecretProvider {
  public async getSecret(key: string): Promise<string> {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Secret key '${key}' not found in environment variables.`);
    }
    return value;
  }
}
