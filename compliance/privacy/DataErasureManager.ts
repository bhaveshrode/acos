import { DataErasureRequest } from "./DataErasureRequest.js";
import { PrivacyAuditRecord } from "./PrivacyAuditRecord.js";
import { LegalHoldManager } from "./LegalHoldManager.js";
import { DataDiscovery } from "./DataDiscovery.js";

/**
 * DataErasureManager managing discovery, hold validation, and purging.
 */
export class DataErasureManager {
  private readonly discovery = new DataDiscovery();

  constructor(private readonly holdManager: LegalHoldManager) {}

  public executeErasure(
    request: DataErasureRequest,
    databaseMock: Array<{ id: string; userId: string; [key: string]: any }>,
    retentionOverride = false
  ): PrivacyAuditRecord {
    // 1. Verify holds
    if (this.holdManager.hasHold(request.userId)) {
      return new PrivacyAuditRecord(request.userId, "ERASURE", "BLOCKED_BY_HOLD");
    }

    // 2. Discover records
    const discoveredPaths = this.discovery.discoverPersonalData(request.userId, databaseMock);

    // 3. Simulated Retention Verification (e.g. active invoice records cannot be deleted)
    const hasUnmetRetention = databaseMock.some(
      (r) => r.userId === request.userId && r.type === "INVOICE" && !retentionOverride
    );

    if (hasUnmetRetention) {
      return new PrivacyAuditRecord(request.userId, "ERASURE", "BLOCKED_BY_RETENTION");
    }

    // 4. Execute deletion on mutable mock reference
    for (const path of discoveredPaths) {
      const recordId = path.split("/")[1];
      const idx = databaseMock.findIndex((r) => r.id === recordId);
      if (idx !== -1) {
        databaseMock.splice(idx, 1);
      }
    }

    return new PrivacyAuditRecord(request.userId, "ERASURE", "SUCCESS");
  }
}
