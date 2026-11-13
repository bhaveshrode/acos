import { BasePage } from "./BasePage.js";

/**
 * SettlementPage managing settlements workflow listings.
 */
export class SettlementPage extends BasePage {
  public render(): string {
    return `<div class="settlement-page"><h1>Settlements</h1><div>${
      this.getElement("settlementList") || ""
    }</div></div>`;
  }
}
