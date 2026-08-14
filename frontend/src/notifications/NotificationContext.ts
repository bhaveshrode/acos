import { NotificationMetadata } from "./NotificationMetadata.js";

/**
 * NotificationContext grouping metadata collections and channel listings.
 */
export class NotificationContext {
  constructor(
    public readonly metadata: NotificationMetadata,
    public readonly activeNotifications: ReadonlyArray<string> = [],
    public readonly displayQueue: ReadonlyArray<string> = [],
    public readonly channels: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.activeNotifications);
    Object.freeze(this.displayQueue);
    Object.freeze(this.channels);
    Object.freeze(this);
  }
}
