/**
 * PilotReport detailing cohort volume.
 */
export class PilotReport {
  constructor(
    public readonly activeMerchantsCount: number,
    public readonly totalVolumeAmount: number,
    public readonly failedTransactionsCount: number
  ) {
    Object.freeze(this);
  }
}
