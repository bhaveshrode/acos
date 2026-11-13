import { BaseNotification } from "./BaseNotification.js";

/**
 * InformationNotification showing informational details.
 */
export class InformationNotification extends BaseNotification {
  public render(): string {
    return `<div class="notification info">ℹ️ ${this.message}</div>`;
  }
}
