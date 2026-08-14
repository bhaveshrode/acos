import { IExternalIdentityProvider } from "./IExternalIdentityProvider.js";

/**
 * ClerkAdapter adapting external Clerk SDK APIs.
 */
export class ClerkAdapter implements IExternalIdentityProvider {
  public async validateToken(token: string): Promise<boolean> {
    return token.startsWith("clerk_");
  }

  public async getUserDetails(token: string): Promise<Record<string, any>> {
    return { sub: "clerk-usr-80", provider: "clerk" };
  }
}
