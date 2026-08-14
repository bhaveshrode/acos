import { BasePage } from "./BasePage.js";

/**
 * IdentityPage managing user profile lists.
 */
export class IdentityPage extends BasePage {
  public render(): string {
    return `<div class="identity-page"><h1>User Accounts</h1><div>${
      this.getElement("usersList") || ""
    }</div></div>`;
  }
}
