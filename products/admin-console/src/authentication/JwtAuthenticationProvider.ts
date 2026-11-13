import { IAuthenticationProvider } from "./IAuthenticationProvider.js";
import { AuthenticationResult } from "./AuthenticationResult.js";
import { IdentityApi } from "../api/IdentityApi.js";
import { UserSession } from "./UserSession.js";

/**
 * JwtAuthenticationProvider authenticating users using JWT tokens via REST APIs.
 */
export class JwtAuthenticationProvider implements IAuthenticationProvider {
  constructor(private readonly identityApi: IdentityApi) {}

  public async authenticate(credentials: any): Promise<AuthenticationResult> {
    try {
      const response = await this.identityApi.login(credentials);
      const data = response.data;
      if (data && data.token) {
        const claims = data.claims || {};
        const expirationTime = Date.now() + (data.expiresInSeconds || 3600) * 1000;
        const session = new UserSession(
          data.userId || "user-id",
          credentials.username || "user",
          data.token,
          claims,
          expirationTime,
          data.refreshToken
        );
        return AuthenticationResult.success(session);
      }
      return AuthenticationResult.failed("No token returned from login response");
    } catch (err: any) {
      return AuthenticationResult.failed(err.message || "JWT Authentication failed");
    }
  }
}
