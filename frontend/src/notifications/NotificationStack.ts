import { INotification } from "./INotification.js";

/**
 * NotificationStack organizing notifications by placement coordinates.
 */
export class NotificationStack {
  private readonly placements = new Map<string, INotification[]>();

  public pushToPlacement(placement: string, notification: INotification): void {
    if (!this.placements.has(placement)) {
      this.placements.set(placement, []);
    }
    this.placements.get(placement)!.push(notification);
  }

  public getForPlacement(placement: string): INotification[] {
    return this.placements.get(placement) || [];
  }
}
