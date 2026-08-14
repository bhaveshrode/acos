"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormBinder = void 0;
/**
 * FormBinder binding data models to forms and reading field states back to domain objects.
 */
class FormBinder {
    bindModelToForm(form, model) {
        for (const [key, value] of Object.entries(model)) {
            if (form.getField(key)) {
                form.setFieldValue(key, value);
            }
        }
    }
    readFormToModel(form, model) {
        const updated = { ...model };
        for (const field of form.getFields()) {
            updated[field.name] = field.value;
        }
        return updated;
    }
}
exports.FormBinder = FormBinder;
