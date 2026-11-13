import { ComponentEventDispatcher } from "./ComponentEventDispatcher.js";
import { ComponentEvent } from "./ComponentEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * ComponentObserver subscribing to lifecycle events returning SubscriptionToken wrappers.
 */
export class ComponentObserver {
  constructor(private readonly dispatcher: ComponentEventDispatcher) {}

  public observe(callback: (event: ComponentEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
