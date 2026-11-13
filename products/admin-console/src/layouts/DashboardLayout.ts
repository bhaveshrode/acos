import { BaseLayout } from "./BaseLayout.js";

/**
 * DashboardLayout rendering widgets sections.
 */
export class DashboardLayout extends BaseLayout {
  public render(): string {
    const sidebar = this.getRegion("sidebar") || "";
    const content = this.getRegion("content") || "";
    return `<div class="dashboard-shell"><aside class="sidebar">${sidebar}</aside><main class="main-content">${content}</main></div>`;
  }
}
