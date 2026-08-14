import { BaseComponent } from "./BaseComponent.js";

/**
 * CardComponent rendering structural cards panels.
 */
export class CardComponent extends BaseComponent<{ title: string; children?: string }> {
  public render(): string {
    return `<div class="card"><div class="card-header">${this.props.title}</div><div class="card-body">${this.props.children || ""}</div></div>`;
  }
}
