import { BaseComponent } from "./BaseComponent.js";

/**
 * InputComponent rendering input elements.
 */
export class InputComponent extends BaseComponent<{ value: string; placeholder?: string; type?: string }> {
  public render(): string {
    const type = this.props.type || "text";
    return `<input type="${type}" value="${this.props.value}" placeholder="${this.props.placeholder || ""}" class="input" />`;
  }
}
