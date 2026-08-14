import { ComplianceEvidence } from "./ComplianceEvidence.js";
/**
 * EvidenceCollector extracting and saving proofs from actions.
 */
export class EvidenceCollector {
    store;
    constructor(store) {
        this.store = store;
    }
    collectFromAudit(requirementCode, record) {
        const evidence = new ComplianceEvidence(requirementCode, `Attributed ${record.action} execution on ${record.resource}`, record.actorId, record.correlationId, record.result);
        this.store.save(evidence);
        return evidence;
    }
}
