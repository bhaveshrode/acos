/**
 * AuthenticationRegistry catalog class keeping authentication provider pointers.
 */
export class AuthenticationRegistry {
  private static providers = new Map<string, any>();

  /**
   * Registers a provider instance.
   */
  public static register(name: string, provider: any): void {
    this.providers.set(name, provider);
  }

  /**
   * Resolves a provider instance by name.
   */
  public static getProvider(name: string): any {
    return this.providers.get(name);
  }

  /**
   * Clears registry entries.
   */
  public static clear(): void {
    this.providers.clear();
  }
}
