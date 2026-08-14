/**
 * ComplianceEvidence proving a compliance control was executed successfully.
 */
export class ComplianceEvidence {
    requirementCode;
    controlPerformed;
    actorId;
    correlationId;
    executionResult;
    timestamp;
    constructor(requirementCode, controlPerformed, actorId, correlationId, executionResult, timestamp = new Date()) {
        this.requirementCode = requirementCode;
        this.controlPerformed = controlPerformed;
        this.actorId = actorId;
        this.correlationId = correlationId;
        this.executionResult = executionResult;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
