/**
 * SecurityAuditRecord carrying security event details.
 */
export class SecurityAuditRecord {
    eventId;
    category;
    description;
    severity;
    timestamp;
    constructor(eventId, category, description, severity, timestamp = new Date()) {
        this.eventId = eventId;
        this.category = category;
        this.description = description;
        this.severity = severity;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
