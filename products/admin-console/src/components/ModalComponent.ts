import { BaseComponent } from "./BaseComponent.js";

/**
 * ModalComponent rendering overlay dialog containers.
 */
export class ModalComponent extends BaseComponent<{ isOpen: boolean; children?: string }> {
  public render(): string {
    if (!this.props.isOpen) return "";
    return `<div class="modal"><div class="modal-content">${this.props.children || ""}</div></div>`;
  }
}
