/**
 * ComplianceProductDashboard summarizing governance trail and security exceptions.
 */
export class ComplianceProductDashboard {
  constructor(
    public readonly auditLogCount: number,
    public readonly securityEventCount: number,
    public readonly activeLegalHoldsCount: number,
    public readonly unprocessedErasureRequestsCount: number,
    public readonly generatedTaxReportsCount: number
  ) {
    Object.freeze(this);
  }
}
