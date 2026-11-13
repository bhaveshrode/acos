import { AuthorizationEventDispatcher } from "./AuthorizationEventDispatcher.js";
import { AuthorizationEvent } from "./AuthorizationEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * AuthorizationObserver observing dispatcher events returning SubscriptionToken wrappers.
 */
export class AuthorizationObserver {
  constructor(private readonly dispatcher: AuthorizationEventDispatcher) {}

  public observe(callback: (event: AuthorizationEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
