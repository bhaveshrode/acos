import { Money } from "../value-objects/Money.js";
import { TaxRate } from "../value-objects/TaxRate.js";

/**
 * Domain Service responsible for computing tax amounts based on subtotal and percentage rate.
 */
export class TaxCalculator {
  /**
   * Computes the absolute tax money amount from a subtotal and tax percentage.
   */
  public calculateTax(subtotal: Money, rate: TaxRate): Money {
    const rawTaxAmount = subtotal.amount * (rate.value / 100);
    return Money.create(rawTaxAmount, subtotal.currency).value;
  }
}
