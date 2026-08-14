import { NotificationEventDispatcher } from "./NotificationEventDispatcher.js";
import { NotificationEvent } from "./NotificationEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * NotificationObserver subscribing to alerts changes.
 */
export class NotificationObserver {
  constructor(private readonly dispatcher: NotificationEventDispatcher) {}

  public observe(callback: (event: NotificationEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}
