import { AuthorizationPolicy } from "./AuthorizationPolicy.js";
import { CompiledPolicy } from "./CompiledPolicy.js";

/**
 * PolicyRegistry cataloging compiled policy templates, preventing mutations post startup.
 */
export class PolicyRegistry {
  private readonly policies = new Map<string, CompiledPolicy>();
  private isFrozen: boolean = false;

  public register(policy: AuthorizationPolicy): void {
    if (this.isFrozen) {
      throw new Error("PolicyRegistry is frozen and cannot accept further policies");
    }
    const compiled = CompiledPolicy.compile(policy);
    this.policies.set(policy.name, compiled);
  }

  public getPolicy(name: string): CompiledPolicy | undefined {
    return this.policies.get(name);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
