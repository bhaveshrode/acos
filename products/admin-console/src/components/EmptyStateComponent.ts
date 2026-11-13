import { BaseComponent } from "./BaseComponent.js";

/**
 * EmptyStateComponent rendering missing data indicators views.
 */
export class EmptyStateComponent extends BaseComponent<{ title: string; message: string }> {
  public render(): string {
    return `<div class="empty-state"><h3>${this.props.title}</h3><p>${this.props.message}</p></div>`;
  }
}
