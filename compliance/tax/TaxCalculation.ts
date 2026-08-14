/**
 * TaxCalculation carrying computed tax results.
 */
export class TaxCalculation {
  constructor(
    public readonly baseAmount: number,
    public readonly taxRate: number,
    public readonly taxAmount: number,
    public readonly breakdownDescription: string
  ) {
    Object.freeze(this);
  }
}
