import { BasePage } from "./BasePage.js";

/**
 * NotificationPage managing notifications setup.
 */
export class NotificationPage extends BasePage {
  public render(): string {
    return `<div class="notification-page"><h1>Notifications</h1><div>${
      this.getElement("alerts") || ""
    }</div></div>`;
  }
}
