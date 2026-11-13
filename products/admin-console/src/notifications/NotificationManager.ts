import { INotification } from "./INotification.js";
import { NotificationQueue } from "./NotificationQueue.js";
import { NotificationState } from "./NotificationState.js";

/**
 * NotificationManager coordinating visible active notifications list updates.
 */
export class NotificationManager {
  private readonly active = new Set<INotification>();

  constructor(private readonly queue: NotificationQueue) {}

  public processQueue(): INotification | undefined {
    const next = this.queue.dequeue();
    if (next) {
      next.state = NotificationState.Displaying;
      this.active.add(next);
    }
    return next;
  }

  public dismiss(notification: INotification): void {
    notification.dismiss();
    this.active.delete(notification);
  }

  public getActiveNotifications(): INotification[] {
    return Array.from(this.active);
  }
}
