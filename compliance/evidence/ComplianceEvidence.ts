/**
 * ComplianceEvidence proving a compliance control was executed successfully.
 */
export class ComplianceEvidence {
  constructor(
    public readonly requirementCode: string,
    public readonly controlPerformed: string,
    public readonly actorId: string,
    public readonly correlationId: string,
    public readonly executionResult: string,
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
