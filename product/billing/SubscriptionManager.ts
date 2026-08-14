import { Subscription } from "./Subscription.js";
import { UsageMeter } from "./UsageMeter.js";

/**
 * SubscriptionManager enforcing SaaS plan boundaries on tenants.
 */
export class SubscriptionManager {
  private readonly subscriptions = new Map<string, Subscription>();

  constructor(private readonly meter: UsageMeter) {}

  public registerSubscription(subscription: Subscription): void {
    this.subscriptions.set(subscription.tenantId.toLowerCase(), subscription);
  }

  public getSubscription(tenantId: string): Subscription | undefined {
    return this.subscriptions.get(tenantId.toLowerCase());
  }

  public isWithinLimits(tenantId: string): boolean {
    const sub = this.getSubscription(tenantId);
    if (!sub || !sub.active) {
      return false; // No active plan config
    }

    const currentUsage = this.meter.get(tenantId);
    return currentUsage < sub.plan.maxInvoices;
  }
}
