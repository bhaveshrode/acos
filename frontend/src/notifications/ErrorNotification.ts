import { BaseNotification } from "./BaseNotification.js";

/**
 * ErrorNotification displaying error validations.
 */
export class ErrorNotification extends BaseNotification {
  public render(): string {
    return `<div class="notification error">❌ ${this.message}</div>`;
  }
}
