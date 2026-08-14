import { BasePage } from "./BasePage.js";

/**
 * DashboardPage displaying analytics.
 */
export class DashboardPage extends BasePage {
  public render(): string {
    return `<div class="dashboard-page"><h1>Dashboard</h1><div class="metrics">${
      this.getElement("metrics") || ""
    }</div></div>`;
  }
}
