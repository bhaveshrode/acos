import { createHash } from "crypto";
/**
 * AuditIntegrityVerifier computing and verifying sequential log hashes.
 */
export class AuditIntegrityVerifier {
    signRecord(record, previousSignature = "genesis_seed") {
        const raw = [
            record.actorId,
            record.action,
            record.resource,
            record.eventId,
            record.correlationId,
            record.result,
            record.timestamp.getTime().toString(),
            previousSignature
        ].join("|");
        return createHash("sha256").update(raw).digest("hex");
    }
    verifyChain(records) {
        let lastSig = "genesis_seed";
        for (const record of records) {
            if (!record.signature)
                return false;
            const expected = this.signRecord(record, lastSig);
            if (record.signature !== expected) {
                return false;
            }
            lastSig = record.signature;
        }
        return true;
    }
}
