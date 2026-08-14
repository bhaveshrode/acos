import { ComplianceEvidence } from "./ComplianceEvidence.js";

/**
 * ComplianceEvidenceStore archiving proof trace models.
 */
export class ComplianceEvidenceStore {
  private readonly items: ComplianceEvidence[] = [];

  public save(evidence: ComplianceEvidence): void {
    this.items.push(evidence);
  }

  public getAll(): readonly ComplianceEvidence[] {
    return Object.freeze([...this.items]);
  }

  public clear(): void {
    this.items.length = 0;
  }
}
