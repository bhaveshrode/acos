import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { PermissionResolver as AuthPermissionResolver } from "../authentication/PermissionResolver.js";

/**
 * PermissionResolver evaluating wildcards permissions logic and inheritance.
 */
export class PermissionResolver {
  public static resolve(user: ClaimsPrincipal): string[] {
    return AuthPermissionResolver.resolvePermissions(user);
  }

  public static hasPermission(user: ClaimsPrincipal, permission: string): boolean {
    return AuthPermissionResolver.hasPermission(user, permission);
  }
}
