/**
 * HealthReport detailing overall system statuses.
 */
export class HealthReport {
    overallHealthy;
    timestamp;
    checks;
    constructor(overallHealthy, checks, timestamp = new Date()) {
        this.overallHealthy = overallHealthy;
        this.timestamp = timestamp;
        this.checks = Object.freeze([...checks]);
        Object.freeze(this);
    }
}
