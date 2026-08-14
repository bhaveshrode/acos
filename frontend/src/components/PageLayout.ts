import { BaseComponent } from "./BaseComponent.js";

/**
 * PageLayout rendering standard page shells with headers and main viewports.
 */
export class PageLayout extends BaseComponent<{ title: string; children?: string }> {
  public render(): string {
    return `<div class="page-layout"><header><h1>${this.props.title}</h1></header><main>${this.props.children || ""}</main></div>`;
  }
}
