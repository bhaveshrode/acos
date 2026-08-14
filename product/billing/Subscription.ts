import { ProductPlan } from "./ProductPlan.js";

/**
 * Subscription carrying subscription dates.
 */
export class Subscription {
  constructor(
    public readonly tenantId: string,
    public readonly plan: ProductPlan,
    public readonly startDate: Date = new Date(),
    public readonly active: boolean = true
  ) {
    Object.freeze(this);
  }
}
