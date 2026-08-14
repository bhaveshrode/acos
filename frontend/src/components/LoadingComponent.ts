import { BaseComponent } from "./BaseComponent.js";

/**
 * LoadingComponent rendering loading indicators.
 */
export class LoadingComponent extends BaseComponent<{ message?: string }> {
  public render(): string {
    return `<div class="loading"><span class="spinner"></span><p>${this.props.message || "Loading..."}</p></div>`;
  }
}
