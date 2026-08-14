import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * AuthorizationPolicy bundling authorization requirements lists.
 */
export class AuthorizationPolicy {
  constructor(
    public readonly name: string,
    public readonly requirements: ReadonlyArray<AuthorizationRequirement> = []
  ) {
    Object.freeze(this.requirements);
    Object.freeze(this);
  }
}
