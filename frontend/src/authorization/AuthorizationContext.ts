import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { AuthorizationState } from "./AuthorizationState.js";

/**
 * AuthorizationContext carrying authenticated principal, resolved permissions, and metadata.
 */
export class AuthorizationContext {
  constructor(
    public readonly user: ClaimsPrincipal,
    public readonly permissions: ReadonlyArray<string> = [],
    public readonly resourceMetadata: Readonly<Record<string, any>> = {},
    public readonly state: AuthorizationState = AuthorizationState.Unknown
  ) {
    Object.freeze(this.permissions);
    Object.freeze(this.resourceMetadata);
    Object.freeze(this);
  }
}
