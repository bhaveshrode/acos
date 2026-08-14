import { ProductComposition } from "./ProductComposition.js";

/**
 * ProductFactory acting as the centralized composition Gateway root.
 */
export class ProductFactory {
  constructor(
    public readonly composition = new ProductComposition()
  ) {
    Object.freeze(this);
  }

  public get flags() { return this.composition.featureFlags; }
  public get onboarding() { return this.composition.onboarding; }
  public get usage() { return this.composition.usageMeter; }
  public get billing() { return this.composition.subscriptions; }
  public get providers() { return this.composition.providers; }
  public get security() { return this.composition.security; }
  public get certifier() { return this.composition.certifier; }
}
