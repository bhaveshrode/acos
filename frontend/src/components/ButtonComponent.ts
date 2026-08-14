import { BaseComponent } from "./BaseComponent.js";

/**
 * ButtonComponent rendering button elements.
 */
export class ButtonComponent extends BaseComponent<{ label: string; disabled?: boolean }> {
  public render(): string {
    return `<button class="btn"${this.props.disabled ? " disabled" : ""}>${this.props.label}</button>`;
  }
}
