import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * AuthorizationPolicy bundling check requirements.
 */
export class AuthorizationPolicy {
  constructor(
    public readonly name: string,
    public readonly requirements: AuthorizationRequirement[] = []
  ) {}
}
