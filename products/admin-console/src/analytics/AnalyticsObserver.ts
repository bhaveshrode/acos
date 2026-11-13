import { AnalyticsEventDispatcher } from "./AnalyticsEventDispatcher.js";
import { AnalyticsLifecycleEvent } from "./AnalyticsLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * AnalyticsObserver subscribing to lifecycle telemetry events.
 */
export class AnalyticsObserver {
  constructor(private readonly dispatcher: AnalyticsEventDispatcher) {}

  public observe(callback: (event: AnalyticsLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
