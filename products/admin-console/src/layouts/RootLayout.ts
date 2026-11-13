import { BaseLayout } from "./BaseLayout.js";

/**
 * RootLayout rendering the overall application shell.
 */
export class RootLayout extends BaseLayout {
  public render(): string {
    return `<div class="root-shell">${this.getRegion("content") || ""}</div>`;
  }
}
