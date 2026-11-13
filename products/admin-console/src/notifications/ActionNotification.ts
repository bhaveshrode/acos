import { BaseNotification } from "./BaseNotification.js";
import { NotificationContext } from "./NotificationContext.js";

/**
 * ActionNotification displaying actionable buttons callbacks.
 */
export class ActionNotification extends BaseNotification {
  constructor(
    context: NotificationContext,
    message: string,
    public readonly onAction: () => void
  ) {
    super(context, message);
  }

  public render(): string {
    return `<div class="notification action">🔔 ${this.message} <button class="action-btn">Action</button></div>`;
  }

  public triggerAction(): void {
    this.onAction();
  }
}
