import { BaseNotification } from "./BaseNotification.js";

/**
 * WarningNotification showing warnings warnings.
 */
export class WarningNotification extends BaseNotification {
  public render(): string {
    return `<div class="notification warning">⚠️ ${this.message}</div>`;
  }
}
