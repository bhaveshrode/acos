import { ClaimsPrincipal } from "./ClaimsPrincipal.js";

/**
 * PermissionResolver evaluating role permissions maps and matching wildcard authorizations.
 */
export class PermissionResolver {
  private static readonly ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: ["*"],
    manager: ["read:*", "write:customer", "write:invoice"],
    user: ["read:*"]
  };

  public static resolvePermissions(principal: ClaimsPrincipal): string[] {
    const roles: string[] = [];
    const roleClaim = principal.getClaim("role") || principal.getClaim("roles");
    if (Array.isArray(roleClaim)) {
      roles.push(...roleClaim);
    } else if (typeof roleClaim === "string") {
      roles.push(roleClaim);
    }

    const permissions = new Set<string>();
    for (const role of roles) {
      const list = this.ROLE_PERMISSIONS[role.toLowerCase()];
      if (list) {
        list.forEach((p) => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  public static hasPermission(principal: ClaimsPrincipal, permission: string): boolean {
    const principalPermissions = this.resolvePermissions(principal);
    if (principalPermissions.includes("*")) return true;
    if (principalPermissions.includes(permission)) return true;

    const parts = permission.split(":");
    if (parts.length === 2) {
      const wildcard = `${parts[0]}:*`;
      if (principalPermissions.includes(wildcard)) return true;
    }

    return false;
  }
}
