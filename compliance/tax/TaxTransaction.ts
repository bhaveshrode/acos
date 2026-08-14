import { TaxCalculation } from "./TaxCalculation.js";

/**
 * TaxTransaction documenting tax values computed for business transactions.
 */
export class TaxTransaction {
  constructor(
    public readonly transactionId: string,
    public readonly invoiceId: string,
    public readonly jurisdictionCode: string,
    public readonly calculation: TaxCalculation,
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
