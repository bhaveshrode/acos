import { FactoryEventDispatcher } from "./FactoryEventDispatcher.js";
import { FactoryLifecycleEvent } from "./FactoryLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * FactoryObserver subscribing to factory composition updates.
 */
export class FactoryObserver {
  constructor(private readonly dispatcher: FactoryEventDispatcher) {}

  public observe(callback: (event: FactoryLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
