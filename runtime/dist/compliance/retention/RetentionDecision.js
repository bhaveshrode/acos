/**
 * RetentionDecision mapping outcomes.
 */
export class RetentionDecision {
    shouldPurge;
    reason;
    timestamp;
    constructor(shouldPurge, reason, timestamp = new Date()) {
        this.shouldPurge = shouldPurge;
        this.reason = reason;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
