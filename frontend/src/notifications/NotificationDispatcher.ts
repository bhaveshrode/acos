import { INotification } from "./INotification.js";
import { NotificationQueue } from "./NotificationQueue.js";

/**
 * NotificationDispatcher routing and dispatching notification objects.
 */
export class NotificationDispatcher {
  constructor(private readonly queue: NotificationQueue) {}

  public dispatch(notification: INotification, priority: number = 0): void {
    this.queue.enqueue(notification, priority);
  }
}
