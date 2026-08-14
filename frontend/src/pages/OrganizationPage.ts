import { BasePage } from "./BasePage.js";

/**
 * OrganizationPage managing teams layouts.
 */
export class OrganizationPage extends BasePage {
  public render(): string {
    return `<div class="org-page"><h1>Organizations</h1><div>${
      this.getElement("orgDetails") || ""
    }</div></div>`;
  }
}
