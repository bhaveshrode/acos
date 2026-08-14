import { IAuthenticationProvider } from "./IAuthenticationProvider.js";
import { AuthenticationResult } from "./AuthenticationResult.js";
import { UserSession } from "./UserSession.js";

/**
 * ApiKeyAuthenticationProvider supporting API key headers authentication checks.
 */
export class ApiKeyAuthenticationProvider implements IAuthenticationProvider {
  public async authenticate(credentials: any): Promise<AuthenticationResult> {
    if (credentials && credentials.apiKey) {
      const session = new UserSession(
        "service-id",
        "service-principal",
        credentials.apiKey,
        { role: "service" },
        Date.now() + 365 * 24 * 3600 * 1000
      );
      return AuthenticationResult.success(session);
    }
    return AuthenticationResult.failed("Api key credentials must contain apiKey field");
  }
}
