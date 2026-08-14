import { IAuthenticationProvider } from "./IAuthenticationProvider.js";

/**
 * AuthenticationProviderRegistry cataloging all registered active authentication identity providers.
 */
export class AuthenticationProviderRegistry {
  private readonly providers = new Map<string, IAuthenticationProvider>();
  private isFrozen: boolean = false;

  public register(name: string, provider: IAuthenticationProvider): void {
    if (this.isFrozen) {
      throw new Error("AuthenticationProviderRegistry is frozen and cannot accept further providers");
    }
    this.providers.set(name, provider);
  }

  public getProvider(name: string): IAuthenticationProvider | undefined {
    return this.providers.get(name);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
