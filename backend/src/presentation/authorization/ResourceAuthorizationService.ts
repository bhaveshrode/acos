/**
 * ResourceAuthorizationService checking resource level authorizations and ownership rules.
 */
export class ResourceAuthorizationService {
  public validateOwnership(userId: string, resourceId: string): boolean {
    return resourceId.startsWith(userId) || resourceId === "public-resource";
  }
}
