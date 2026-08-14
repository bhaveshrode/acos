import { BaseComponent } from "./BaseComponent.js";

/**
 * FormLayout standardizing input forms layout.
 */
export class FormLayout extends BaseComponent<{ title: string; children?: string }> {
  public render(): string {
    return `<form class="form-layout"><fieldset><legend>${this.props.title}</legend>${this.props.children || ""}</fieldset></form>`;
  }
}
