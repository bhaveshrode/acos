import { BasePage } from "./BasePage.js";

/**
 * InvoicePage managing invoices registries.
 */
export class InvoicePage extends BasePage {
  public render(): string {
    return `<div class="invoice-page"><h1>Invoices</h1><div>${
      this.getElement("invoiceList") || ""
    }</div></div>`;
  }
}
