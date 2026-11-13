import { BaseComponent } from "./BaseComponent.js";

/**
 * DashboardLayout standardizing widgets placements and dashboard metrics layout views.
 */
export class DashboardLayout extends BaseComponent<{ title: string; children?: string }> {
  public render(): string {
    return `<div class="dashboard-layout"><header><h2>${this.props.title} Dashboard</h2></header><div class="widgets-grid">${this.props.children || ""}</div></div>`;
  }
}
