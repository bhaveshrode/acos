/**
 * DataErasureRequest carrying erasure demands.
 */
export class DataErasureRequest {
    userId;
    tenantId;
    timestamp;
    constructor(userId, tenantId, timestamp = new Date()) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
