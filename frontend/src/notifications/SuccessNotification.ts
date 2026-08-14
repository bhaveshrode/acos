import { BaseNotification } from "./BaseNotification.js";

/**
 * SuccessNotification showing successful operation indicators.
 */
export class SuccessNotification extends BaseNotification {
  public render(): string {
    return `<div class="notification success">✅ ${this.message}</div>`;
  }
}
