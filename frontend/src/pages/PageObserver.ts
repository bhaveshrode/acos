import { PageEventDispatcher } from "./PageEventDispatcher.js";
import { PageLifecycleEvent } from "./PageLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * PageObserver observing page lifecycle transitions.
 */
export class PageObserver {
  constructor(private readonly dispatcher: PageEventDispatcher) {}

  public observe(callback: (event: PageLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
