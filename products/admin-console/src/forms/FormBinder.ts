import { IForm } from "./IForm.js";

/**
 * FormBinder binding data models to forms and reading field states back to domain objects.
 */
export class FormBinder {
  public bindModelToForm(form: IForm, model: Record<string, any>): void {
    for (const [key, value] of Object.entries(model)) {
      if (form.getField(key)) {
        form.setFieldValue(key, value);
      }
    }
  }

  public readFormToModel(form: IForm, model: Record<string, any>): Record<string, any> {
    const updated = { ...model };
    for (const field of form.getFields()) {
      updated[field.name] = field.value;
    }
    return updated;
  }
}
