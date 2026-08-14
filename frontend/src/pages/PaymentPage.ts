import { BasePage } from "./BasePage.js";

/**
 * PaymentPage managing payment receipts.
 */
export class PaymentPage extends BasePage {
  public render(): string {
    return `<div class="payment-page"><h1>Payments</h1><div>${
      this.getElement("paymentForm") || ""
    }</div></div>`;
  }
}
