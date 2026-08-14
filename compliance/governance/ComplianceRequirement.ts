import { ComplianceContext } from "./ComplianceContext.js";

/**
 * ComplianceRequirement defining a single policy evaluation check.
 */
export class ComplianceRequirement {
  constructor(
    public readonly code: string,
    public readonly description: string,
    public readonly evaluateFn: (context: ComplianceContext) => boolean
  ) {
    Object.freeze(this);
  }

  public isSatisfiedBy(context: ComplianceContext): boolean {
    return this.evaluateFn(context);
  }
}
