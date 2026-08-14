import { TaxTransaction } from "./TaxTransaction.js";

/**
 * TaxReport detailing totals.
 */
export class TaxReport {
  public readonly transactions: readonly TaxTransaction[];

  constructor(
    public readonly reportId: string,
    public readonly jurisdictionCode: string,
    public readonly totalBaseAmount: number,
    public readonly totalTaxAmount: number,
    transactions: TaxTransaction[]
  ) {
    this.transactions = Object.freeze([...transactions]);
    Object.freeze(this);
  }
}
