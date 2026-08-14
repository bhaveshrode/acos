/**
 * ComplianceDecision recording governance outcomes.
 */
export class ComplianceDecision {
  public readonly violatedRequirements: readonly string[];

  constructor(
    public readonly isAllowed: boolean,
    violatedRequirements: string[],
    public readonly timestamp: Date = new Date()
  ) {
    this.violatedRequirements = Object.freeze([...violatedRequirements]);
    Object.freeze(this);
  }
}
