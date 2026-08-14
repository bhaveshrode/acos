import { AuditRecord } from "./AuditRecord.js";
import { AuditStore } from "./AuditStore.js";
import { AuditIntegrityVerifier } from "./AuditIntegrityVerifier.js";

/**
 * AuditTrailLogger sequencing and logging records.
 */
export class AuditTrailLogger {
  private readonly verifier = new AuditIntegrityVerifier();

  constructor(private readonly store: AuditStore) {}

  public log(record: AuditRecord): AuditRecord {
    const all = this.store.getAll();
    const prevSig = all.length > 0 ? all[all.length - 1].signature : "genesis_seed";

    // 1. Calculate signature before freezing the record
    const sig = this.verifier.signRecord(record, prevSig);

    // 2. Construct frozen signed record
    const signedRecord = new AuditRecord(
      record.actorId,
      record.actorType,
      record.tenantId,
      record.action,
      record.resource,
      record.eventId,
      record.correlationId,
      record.causationId,
      record.policy,
      record.authorization,
      record.result,
      record.timestamp,
      sig
    );

    this.store.save(signedRecord);
    return signedRecord;
  }
}
