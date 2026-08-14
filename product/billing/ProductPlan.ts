import { ProductProfile } from "../configuration/ProductProfile.js";

/**
 * ProductPlan declaring plan-specific limits.
 */
export class ProductPlan {
  constructor(
    public readonly profile: ProductProfile,
    public readonly name: string,
    public readonly maxInvoices: number,
    public readonly monthlyPrice: number
  ) {
    Object.freeze(this);
  }
}
