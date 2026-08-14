import { WebSocketEventDispatcher } from "./WebSocketEventDispatcher.js";
import { WebSocketLifecycleEvent } from "./WebSocketLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * WebSocketObserver observing socket transitions.
 */
export class WebSocketObserver {
  constructor(private readonly dispatcher: WebSocketEventDispatcher) {}

  public observe(callback: (event: WebSocketLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
