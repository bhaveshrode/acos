/**
 * ClaimsPrincipalBuilder compiling claims information to user identity models.
 */
export class ClaimsPrincipalBuilder {
  public build(claims: any): any {
    return {
      id: claims.sub || claims.id,
      role: claims.role || "user",
      permissions: claims.permissions || []
    };
  }
}
