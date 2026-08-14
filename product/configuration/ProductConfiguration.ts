import { ProductProfile } from "./ProductProfile.js";
import { ProductLimits } from "./ProductLimits.js";

/**
 * ProductConfiguration capturing launch parameters.
 */
export class ProductConfiguration {
  constructor(
    public readonly profile: ProductProfile,
    public readonly enabledPaymentProviders: string[],
    public readonly limits: ProductLimits
  ) {
    Object.freeze(this.enabledPaymentProviders);
    Object.freeze(this);
  }
}
