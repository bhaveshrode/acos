import { LayoutEventDispatcher } from "./LayoutEventDispatcher.js";
import { LayoutLifecycleEvent } from "./LayoutLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * LayoutObserver observing structural changes returning SubscriptionToken wrappers.
 */
export class LayoutObserver {
  constructor(private readonly dispatcher: LayoutEventDispatcher) {}

  public observe(callback: (event: LayoutLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
