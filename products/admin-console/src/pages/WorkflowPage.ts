import { BasePage } from "./BasePage.js";

/**
 * WorkflowPage managing workflows structures.
 */
export class WorkflowPage extends BasePage {
  public render(): string {
    return `<div class="workflow-page"><h1>Workflows</h1><div>${
      this.getElement("workflows") || ""
    }</div></div>`;
  }
}
