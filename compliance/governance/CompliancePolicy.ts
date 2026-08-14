import { ComplianceRequirement } from "./ComplianceRequirement.js";

/**
 * CompliancePolicy grouping requirements under a logical policy code.
 */
export class CompliancePolicy {
  public readonly requirements: readonly ComplianceRequirement[];

  constructor(
    public readonly code: string,
    public readonly description: string,
    requirements: ComplianceRequirement[]
  ) {
    this.requirements = Object.freeze([...requirements]);
    Object.freeze(this);
  }
}
