import { BasePage } from "./BasePage.js";

/**
 * SettingsPage managing configuration sections.
 */
export class SettingsPage extends BasePage {
  public render(): string {
    return `<div class="settings-page"><h1>Settings</h1><div>${
      this.getElement("settingsMenu") || ""
    }</div></div>`;
  }
}
