import { AuthenticationEventDispatcher } from "./AuthenticationEventDispatcher.js";
import { AuthenticationEvent } from "./AuthenticationEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * AuthenticationObserver listening to dispatcher notifications returning SubscriptionTokens.
 */
export class AuthenticationObserver {
  constructor(private readonly dispatcher: AuthenticationEventDispatcher) {}

  public observe(callback: (event: AuthenticationEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
