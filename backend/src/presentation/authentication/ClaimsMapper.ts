import { AuthenticationContext } from "./AuthenticationContext.js";

/**
 * ClaimsMapper translating JWT properties to AuthenticationContext payload fields.
 */
export class ClaimsMapper {
  public map(claims: any, token: string): AuthenticationContext {
    return new AuthenticationContext({
      user: {
        id: claims.sub || claims.id,
        role: claims.role || "user",
        permissions: claims.permissions || []
      },
      organizationId: claims.orgId,
      token,
      isAuthenticated: true
    });
  }
}
