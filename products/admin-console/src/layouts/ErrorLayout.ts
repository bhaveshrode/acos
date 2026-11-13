import { BaseLayout } from "./BaseLayout.js";

/**
 * ErrorLayout rendering standardized fallback panels.
 */
export class ErrorLayout extends BaseLayout {
  public render(): string {
    return `<div class="error-shell"><div class="error-box">${this.getRegion("content") || ""}</div></div>`;
  }
}
