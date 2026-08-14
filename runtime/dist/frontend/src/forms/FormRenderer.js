"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormRenderer = void 0;
const RenderResult_js_1 = require("../components/RenderResult.js");
/**
 * FormRenderer rendering registered forms structures and returning RenderResult diagnostics.
 */
class FormRenderer {
    render(form) {
        const start = performance.now();
        const fieldsHtml = form
            .getFields()
            .map((f) => {
            return `<div class="form-field"><label>${f.name}</label><input type="${f.type}" value="${f.value}" />${f.error ? `<span class="error">${f.error}</span>` : ""}</div>`;
        })
            .join("");
        const output = `<form class="form">${fieldsHtml}</form>`;
        const duration = performance.now() - start;
        return new RenderResult_js_1.RenderResult(output, duration, {
            formId: form.context.metadata.id
        });
    }
}
exports.FormRenderer = FormRenderer;
