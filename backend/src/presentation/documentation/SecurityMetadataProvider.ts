/**
 * SecurityMetadataProvider maps authentication scheme descriptors.
 */
export class SecurityMetadataProvider {
  public getSecurityRequirements(path: string): string[] {
    if (path.startsWith("/users/login") || path.startsWith("/users/register")) {
      return [];
    }
    return ["BearerAuth"];
  }
}
