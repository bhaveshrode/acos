import { BaseComponent } from "./BaseComponent.js";

/**
 * DialogLayout standardizing modal dialog container layout.
 */
export class DialogLayout extends BaseComponent<{ title: string; children?: string }> {
  public render(): string {
    return `<div class="dialog-layout"><div class="dialog-header"><h3>${this.props.title}</h3></div><div class="dialog-body">${this.props.children || ""}</div></div>`;
  }
}
