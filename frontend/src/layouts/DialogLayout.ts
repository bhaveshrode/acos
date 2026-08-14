import { BaseLayout } from "./BaseLayout.js";

/**
 * DialogLayout rendering dialog containers.
 */
export class DialogLayout extends BaseLayout {
  public render(): string {
    return `<div class="dialog-shell"><div class="dialog-content">${this.getRegion("content") || ""}</div></div>`;
  }
}
