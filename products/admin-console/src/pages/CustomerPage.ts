import { BasePage } from "./BasePage.js";

/**
 * CustomerPage managing customer records.
 */
export class CustomerPage extends BasePage {
  public render(): string {
    return `<div class="customer-page"><h1>Customer Directory</h1><div class="list">${
      this.getElement("list") || ""
    }</div></div>`;
  }
}
