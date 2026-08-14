import { BaseComponent } from "./BaseComponent.js";

/**
 * BadgeComponent rendering badges.
 */
export class BadgeComponent extends BaseComponent<{ text: string; variant?: string }> {
  public render(): string {
    return `<span class="badge badge-${this.props.variant || "info"}">${this.props.text}</span>`;
  }
}
