import { BasePage } from "./BasePage.js";

/**
 * AccountsReceivablePage managing receivables accounts histories.
 */
export class AccountsReceivablePage extends BasePage {
  public render(): string {
    return `<div class="receivables-page"><h1>Accounts Receivable</h1><div>${
      this.getElement("summary") || ""
    }</div></div>`;
  }
}
