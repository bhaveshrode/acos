import { BaseComponent } from "./BaseComponent.js";

/**
 * SidebarLayout standardizing sidebars navigation layouts.
 */
export class SidebarLayout extends BaseComponent<{ title: string; sidebar?: string; children?: string }> {
  public render(): string {
    return `<div class="sidebar-layout"><aside class="sidebar-nav"><h2>${this.props.title} Navigation</h2>${this.props.sidebar || ""}</aside><main class="sidebar-content">${this.props.children || ""}</main></div>`;
  }
}
