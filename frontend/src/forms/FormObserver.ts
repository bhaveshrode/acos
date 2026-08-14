import { FormEventDispatcher } from "./FormEventDispatcher.js";
import { FormLifecycleEvent } from "./FormLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * FormObserver observing FormLifecycleEvents returning SubscriptionToken wrappers.
 */
export class FormObserver {
  constructor(private readonly dispatcher: FormEventDispatcher) {}

  public observe(callback: (event: FormLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
