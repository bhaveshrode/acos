/**
 * RetentionRule verifying if record age exceeds target years limit.
 */
export class RetentionRule {
    code;
    allowedAgeYears;
    constructor(code, allowedAgeYears) {
        this.code = code;
        this.allowedAgeYears = allowedAgeYears;
        Object.freeze(this);
    }
    hasExpired(createdAt) {
        const elapsedMs = Date.now() - createdAt.getTime();
        const allowedMs = this.allowedAgeYears * 365 * 24 * 60 * 60 * 1000;
        return elapsedMs > allowedMs;
    }
}
