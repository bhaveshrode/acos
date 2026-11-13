import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";

/**
 * PermissionContext wrapping active users and evaluation scopes details.
 */
export class PermissionContext {
  constructor(
    public readonly user: ClaimsPrincipal,
    public readonly scope?: string
  ) {
    Object.freeze(this);
  }
}
