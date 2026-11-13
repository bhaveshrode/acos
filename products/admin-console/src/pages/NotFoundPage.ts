import { BasePage } from "./BasePage.js";

/**
 * NotFoundPage rendering unmatched routes.
 */
export class NotFoundPage extends BasePage {
  public render(): string {
    return `<div class="not-found-page"><h1>404 Not Found</h1><p>The page does not exist.</p></div>`;
  }
}
