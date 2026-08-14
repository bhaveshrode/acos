/**
 * ComplianceDecision recording governance outcomes.
 */
export class ComplianceDecision {
    isAllowed;
    timestamp;
    violatedRequirements;
    constructor(isAllowed, violatedRequirements, timestamp = new Date()) {
        this.isAllowed = isAllowed;
        this.timestamp = timestamp;
        this.violatedRequirements = Object.freeze([...violatedRequirements]);
        Object.freeze(this);
    }
}
