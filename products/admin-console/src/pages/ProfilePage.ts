import { BasePage } from "./BasePage.js";

/**
 * ProfilePage managing user details.
 */
export class ProfilePage extends BasePage {
  public render(): string {
    return `<div class="profile-page"><h1>User Profile</h1><div>${
      this.getElement("profileDetails") || ""
    }</div></div>`;
  }
}
