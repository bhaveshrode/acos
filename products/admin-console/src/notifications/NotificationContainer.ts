import { INotification } from "./INotification.js";

/**
 * NotificationContainer hosting visible notifications collections.
 */
export class NotificationContainer {
  private readonly notifications: INotification[] = [];

  public add(notification: INotification): void {
    this.notifications.push(notification);
  }

  public remove(notification: INotification): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  public getNotifications(): INotification[] {
    return [...this.notifications];
  }
}
