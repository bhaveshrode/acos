import { ComplianceEvidence } from "./ComplianceEvidence.js";
import { ComplianceEvidenceStore } from "./ComplianceEvidenceStore.js";
import { AuditRecord } from "../audit/AuditRecord.js";

/**
 * EvidenceCollector extracting and saving proofs from actions.
 */
export class EvidenceCollector {
  constructor(private readonly store: ComplianceEvidenceStore) {}

  public collectFromAudit(requirementCode: string, record: AuditRecord): ComplianceEvidence {
    const evidence = new ComplianceEvidence(
      requirementCode,
      `Attributed ${record.action} execution on ${record.resource}`,
      record.actorId,
      record.correlationId,
      record.result
    );
    this.store.save(evidence);
    return evidence;
  }
}
