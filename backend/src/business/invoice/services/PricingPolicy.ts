import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Money } from "../value-objects/Money.js";
import { Discount } from "../value-objects/Discount.js";
import { DiscountType } from "../enums/DiscountType.js";

/**
 * Domain Service enforcing consistent currency calculations for grand totals.
 */
export class PricingPolicy {
  /**
   * Calculates the grand total by summing subtotal and tax total, and subtracting discounts.
   */
  public calculateGrandTotal(
    subtotal: Money,
    taxTotal: Money,
    discount: Discount | null
  ): Result<Money> {
    if (subtotal.currency !== taxTotal.currency) {
      return Result.fail(
        ResultError.conflict("Currency mismatch between subtotal and tax total.")
      );
    }

    let discountAmount = 0;
    if (discount) {
      if (discount.type === DiscountType.PERCENTAGE) {
        discountAmount = subtotal.amount * (discount.value / 100);
      } else {
        discountAmount = discount.value;
      }
    }

    const subtotalAndTax = subtotal.add(taxTotal).value;
    const rawGrandTotal = Math.max(0, subtotalAndTax.amount - discountAmount);
    return Money.create(rawGrandTotal, subtotal.currency);
  }
}
