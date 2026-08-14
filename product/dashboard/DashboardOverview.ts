/**
 * DashboardOverview carrying compiled financial charts.
 */
export class DashboardOverview {
  constructor(
    public readonly totalInvoicedAmount: number,
    public readonly totalCollectedAmount: number,
    public readonly totalSettledAmount: number,
    public readonly accountsReceivableAmount: number
  ) {
    Object.freeze(this);
  }
}
