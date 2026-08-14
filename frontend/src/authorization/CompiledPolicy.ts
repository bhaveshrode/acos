import { AuthorizationRequirement } from "./AuthorizationRequirement.js";
import { AuthorizationPolicy } from "./AuthorizationPolicy.js";

/**
 * CompiledPolicy representing optimized policy checking graphs.
 */
export class CompiledPolicy {
  constructor(
    public readonly name: string,
    public readonly requirements: ReadonlyArray<AuthorizationRequirement>
  ) {
    Object.freeze(this.requirements);
    Object.freeze(this);
  }

  public static compile(policy: AuthorizationPolicy): CompiledPolicy {
    return new CompiledPolicy(policy.name, [...policy.requirements]);
  }
}
