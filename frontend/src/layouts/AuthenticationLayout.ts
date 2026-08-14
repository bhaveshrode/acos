import { BaseLayout } from "./BaseLayout.js";

/**
 * AuthenticationLayout hosting login, registration, and account recovery screens.
 */
export class AuthenticationLayout extends BaseLayout {
  public render(): string {
    return `<div class="auth-shell"><div class="auth-box">${this.getRegion("content") || ""}</div></div>`;
  }
}
