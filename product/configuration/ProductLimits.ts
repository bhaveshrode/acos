/**
 * ProductLimits wrapping invoice limits and volume sizes.
 */
export class ProductLimits {
  constructor(
    public readonly maxInvoicesPerMonth: number,
    public readonly maxMonthlyVolumeAmount: number
  ) {
    Object.freeze(this);
  }
}
