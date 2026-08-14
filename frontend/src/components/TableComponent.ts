import { BaseComponent } from "./BaseComponent.js";

/**
 * TableComponent rendering standard table elements.
 */
export class TableComponent extends BaseComponent<{ headers: string[]; rows: any[][] }> {
  public render(): string {
    const head = this.props.headers.map((h) => `<th>${h}</th>`).join("");
    const body = this.props.rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("");
    return `<table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }
}
