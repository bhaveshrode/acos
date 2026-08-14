"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormSerializer = void 0;
/**
 * FormSerializer serializing form fields data snapshots to JSON strings.
 */
class FormSerializer {
    serialize(form) {
        const data = {};
        for (const field of form.getFields()) {
            data[field.name] = field.value;
        }
        return JSON.stringify({
            formId: form.context.metadata.id,
            state: form.state,
            values: data
        });
    }
    deserialize(json) {
        return JSON.parse(json);
    }
}
exports.FormSerializer = FormSerializer;
