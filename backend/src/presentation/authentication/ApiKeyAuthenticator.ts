/**
 * ApiKeyAuthenticator supporting server-to-server auth integrations.
 */
export class ApiKeyAuthenticator {
  private keys = new Set<string>();

  /**
   * Registers a permitted API key.
   */
  public registerKey(key: string): void {
    this.keys.add(key);
  }

  /**
   * Evaluates key validity.
   */
  public authenticate(key: string): boolean {
    return this.keys.has(key);
  }
}
