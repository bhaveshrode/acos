import { ValidationEventDispatcher } from "./ValidationEventDispatcher.js";
import { ValidationEvent } from "./ValidationEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * ValidationObserver observing validation lifecycle updates returning SubscriptionTokens.
 */
export class ValidationObserver {
  constructor(private readonly dispatcher: ValidationEventDispatcher) {}

  public observe(callback: (event: ValidationEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
