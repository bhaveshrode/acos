import { TaxCalculation } from "./TaxCalculation.js";

/**
 * ITaxProvider abstract adapter contract.
 */
export interface ITaxProvider {
  calculateTax(
    jurisdictionCode: string,
    amount: number
  ): Promise<TaxCalculation>;
}
