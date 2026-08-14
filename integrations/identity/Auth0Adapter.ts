import { IExternalIdentityProvider } from "./IExternalIdentityProvider.js";

/**
 * Auth0Adapter adapting external Auth0 SDK APIs.
 */
export class Auth0Adapter implements IExternalIdentityProvider {
  public async validateToken(token: string): Promise<boolean> {
    return token.startsWith("auth0_");
  }

  public async getUserDetails(token: string): Promise<Record<string, any>> {
    return { sub: "auth0-usr-90", provider: "auth0" };
  }
}
