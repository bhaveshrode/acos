import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { PermissionResolver } from "../authentication/PermissionResolver.js";

/**
 * AuthorizationDirective offering conditional helpers for buttons and actions rendering.
 */
export class AuthorizationDirective {
  public static canRenderElement(user: ClaimsPrincipal, requiredPermission: string): boolean {
    return PermissionResolver.hasPermission(user, requiredPermission);
  }
}
