/**
 * DiagnosticReport formatting target issues reports details.
 */
export class DiagnosticReport {
  constructor(
    public readonly issueDetected: boolean,
    public readonly details: string[],
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.details);
    Object.freeze(this);
  }
}
