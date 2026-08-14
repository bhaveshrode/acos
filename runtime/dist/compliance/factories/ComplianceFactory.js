import { ComplianceComposition } from "./ComplianceComposition.js";
/**
 * ComplianceFactory acting as the centralized composition gateway.
 */
export class ComplianceFactory {
    composition;
    constructor(composition = new ComplianceComposition()) {
        this.composition = composition;
        Object.freeze(this);
    }
    get governance() { return this.composition.governanceEvaluator; }
    get registry() { return this.composition.governanceRegistry; }
    get audit() { return this.composition.auditTrailLogger; }
    get auditStore() { return this.composition.auditStore; }
    get query() { return this.composition.auditQuery; }
    get privacy() { return this.composition.privacyErasureManager; }
    get holds() { return this.composition.privacyHoldManager; }
    get pci() { return this.composition.pciBoundary; }
    get tax() { return this.composition.taxGenerator; }
    get security() { return this.composition.securityLogger; }
    get securityEvidence() { return this.composition.securityEvidence; }
    get retention() { return this.composition.retentionManager; }
    get purge() { return this.composition.retentionPurge; }
    get evidence() { return this.composition.evidenceCollector; }
    get evidenceStore() { return this.composition.evidenceStore; }
    get certifier() { return this.composition.certifier; }
}
