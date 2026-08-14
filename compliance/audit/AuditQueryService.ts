import { AuditStore } from "./AuditStore.js";
import { AuditRecord } from "./AuditRecord.js";

/**
 * AuditQueryService filtering records.
 */
export class AuditQueryService {
  constructor(private readonly store: AuditStore) {}

  public findByTenant(tenantId: string): AuditRecord[] {
    return this.store.getAll().filter((r) => r.tenantId === tenantId);
  }

  public findByActor(actorId: string): AuditRecord[] {
    return this.store.getAll().filter((r) => r.actorId === actorId);
  }

  public findByCorrelation(correlationId: string): AuditRecord[] {
    return this.store.getAll().filter((r) => r.correlationId === correlationId);
  }
}
