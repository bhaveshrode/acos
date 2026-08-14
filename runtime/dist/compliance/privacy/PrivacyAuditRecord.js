/**
 * PrivacyAuditRecord tracking privacy actions.
 */
export class PrivacyAuditRecord {
    userId;
    action;
    status;
    timestamp;
    constructor(userId, action, status, timestamp = new Date()) {
        this.userId = userId;
        this.action = action;
        this.status = status;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
