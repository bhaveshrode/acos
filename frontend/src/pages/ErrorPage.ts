import { BasePage } from "./BasePage.js";

/**
 * ErrorPage rendering standardized application error screens.
 */
export class ErrorPage extends BasePage {
  public render(): string {
    return `<div class="error-page"><h1>500 Internal Error</h1><p>Something went wrong.</p></div>`;
  }
}
