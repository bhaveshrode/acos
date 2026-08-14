import { BaseLayout } from "./BaseLayout.js";

/**
 * SettingsLayout structuring configuration menus and setup sections.
 */
export class SettingsLayout extends BaseLayout {
  public render(): string {
    const nav = this.getRegion("toolbar") || "";
    const content = this.getRegion("content") || "";
    return `<div class="settings-shell"><nav class="settings-nav">${nav}</nav><section class="settings-content">${content}</section></div>`;
  }
}
