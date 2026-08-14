import { INotification } from "./INotification.js";
import { NotificationDispatcher } from "./NotificationDispatcher.js";

/**
 * NotificationScheduler handling delayed notifications runs.
 */
export class NotificationScheduler {
  constructor(private readonly dispatcher: NotificationDispatcher) {}

  public schedule(notification: INotification, delayMs: number, priority: number = 0): void {
    setTimeout(() => {
      this.dispatcher.dispatch(notification, priority);
    }, delayMs);
  }
}
