/**
 * AuditQueryService filtering records.
 */
export class AuditQueryService {
    store;
    constructor(store) {
        this.store = store;
    }
    findByTenant(tenantId) {
        return this.store.getAll().filter((r) => r.tenantId === tenantId);
    }
    findByActor(actorId) {
        return this.store.getAll().filter((r) => r.actorId === actorId);
    }
    findByCorrelation(correlationId) {
        return this.store.getAll().filter((r) => r.correlationId === correlationId);
    }
}
