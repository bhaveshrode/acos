import { BaseNotification } from "./BaseNotification.js";
import { NotificationContext } from "./NotificationContext.js";

/**
 * ProgressNotification displaying operation progress statuses.
 */
export class ProgressNotification extends BaseNotification {
  constructor(
    context: NotificationContext,
    message: string,
    public readonly progressPercent: number = 0
  ) {
    super(context, message);
  }

  public render(): string {
    return `<div class="notification progress">⏳ ${this.message} (${this.progressPercent}%)</div>`;
  }
}
