import { ComplianceEvidence } from "./ComplianceEvidence.js";

/**
 * ComplianceReport wrapping validated checklist items.
 */
export class ComplianceReport {
  public readonly evidences: readonly ComplianceEvidence[];

  constructor(
    public readonly reportId: string,
    public readonly generatedAt: Date = new Date(),
    evidences: ComplianceEvidence[]
  ) {
    this.evidences = Object.freeze([...evidences]);
    Object.freeze(this);
  }
}
