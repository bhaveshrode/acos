import { INotification } from "./INotification.js";
import { RenderResult } from "../components/RenderResult.js";

/**
 * NotificationRenderer formatting notification outputs and returning RenderResult objects.
 */
export class NotificationRenderer {
  public render(notification: INotification): RenderResult {
    const start = performance.now();
    const output = notification.render();
    const duration = performance.now() - start;
    return new RenderResult(output, duration, {
      notificationId: notification.context.metadata.id
    });
  }
}
