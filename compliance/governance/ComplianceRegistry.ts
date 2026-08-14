import { CompliancePolicy } from "./CompliancePolicy.js";

/**
 * ComplianceRegistry storing active policies.
 */
export class ComplianceRegistry {
  private readonly policies = new Map<string, CompliancePolicy>();
  private isFrozen = false;

  public register(policy: CompliancePolicy): void {
    if (this.isFrozen) {
      throw new Error("ComplianceRegistry is frozen and cannot register new policies");
    }
    this.policies.set(policy.code.toLowerCase(), policy);
  }

  public get(code: string): CompliancePolicy | undefined {
    return this.policies.get(code.toLowerCase());
  }

  public freeze(): void {
    this.isFrozen = true;
  }

  public listPolicies(): CompliancePolicy[] {
    return Array.from(this.policies.values());
  }
}
