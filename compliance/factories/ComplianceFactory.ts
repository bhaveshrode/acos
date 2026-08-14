import { ComplianceComposition } from "./ComplianceComposition.js";

/**
 * ComplianceFactory acting as the centralized composition gateway.
 */
export class ComplianceFactory {
  constructor(
    public readonly composition = new ComplianceComposition()
  ) {
    Object.freeze(this);
  }

  public get governance() { return this.composition.governanceEvaluator; }
  public get registry() { return this.composition.governanceRegistry; }
  public get audit() { return this.composition.auditTrailLogger; }
  public get auditStore() { return this.composition.auditStore; }
  public get query() { return this.composition.auditQuery; }
  public get privacy() { return this.composition.privacyErasureManager; }
  public get holds() { return this.composition.privacyHoldManager; }
  public get pci() { return this.composition.pciBoundary; }
  public get tax() { return this.composition.taxGenerator; }
  public get security() { return this.composition.securityLogger; }
  public get securityEvidence() { return this.composition.securityEvidence; }
  public get retention() { return this.composition.retentionManager; }
  public get purge() { return this.composition.retentionPurge; }
  public get evidence() { return this.composition.evidenceCollector; }
  public get evidenceStore() { return this.composition.evidenceStore; }
  public get certifier() { return this.composition.certifier; }
}
