/**
 * PermissionResolver aggregating permissions list corresponding to assigned roles.
 */
export class PermissionResolver {
  public resolvePermissions(roles: string[]): string[] {
    const permissions: string[] = [];
    if (roles.includes("admin")) {
      permissions.push("read", "write", "delete");
    } else if (roles.includes("editor")) {
      permissions.push("read", "write");
    } else {
      permissions.push("read");
    }
    return permissions;
  }
}
