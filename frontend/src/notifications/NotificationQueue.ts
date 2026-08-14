import { INotification } from "./INotification.js";

/**
 * NotificationQueue prioritizing alert items.
 */
export class NotificationQueue {
  private readonly queue: { notification: INotification; priority: number }[] = [];

  public enqueue(notification: INotification, priority: number = 0): void {
    this.queue.push({ notification, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  public dequeue(): INotification | undefined {
    const item = this.queue.shift();
    return item?.notification;
  }

  public size(): number {
    return this.queue.length;
  }
}
