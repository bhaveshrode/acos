import { IForm } from "./IForm.js";
import { RenderResult } from "../components/RenderResult.js";

/**
 * FormRenderer rendering registered forms structures and returning RenderResult diagnostics.
 */
export class FormRenderer {
  public render(form: IForm): RenderResult {
    const start = performance.now();
    const fieldsHtml = form
      .getFields()
      .map((f) => {
        return `<div class="form-field"><label>${f.name}</label><input type="${f.type}" value="${f.value}" />${
          f.error ? `<span class="error">${f.error}</span>` : ""
        }</div>`;
      })
      .join("");

    const output = `<form class="form">${fieldsHtml}</form>`;
    const duration = performance.now() - start;

    return new RenderResult(output, duration, {
      formId: form.context.metadata.id
    });
  }
}
