import { BaseLayout } from "./BaseLayout.js";

/**
 * WorkspaceLayout rendering primary authenticated workspace panels.
 */
export class WorkspaceLayout extends BaseLayout {
  public render(): string {
    const header = this.getRegion("header") || "";
    const content = this.getRegion("content") || "";
    const footer = this.getRegion("footer") || "";
    return `<div class="workspace-shell"><header>${header}</header><main class="workspace-body">${content}</main><footer>${footer}</footer></div>`;
  }
}
