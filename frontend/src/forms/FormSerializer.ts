import { IForm } from "./IForm.js";

/**
 * FormSerializer serializing form fields data snapshots to JSON strings.
 */
export class FormSerializer {
  public serialize(form: IForm): string {
    const data: Record<string, any> = {};
    for (const field of form.getFields()) {
      data[field.name] = field.value;
    }
    return JSON.stringify({
      formId: form.context.metadata.id,
      state: form.state,
      values: data
    });
  }

  public deserialize(json: string): { formId: string; state: string; values: Record<string, any> } {
    return JSON.parse(json);
  }
}
