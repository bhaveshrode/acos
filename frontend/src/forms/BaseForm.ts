import { IForm } from "./IForm.js";
import { FormContext } from "./FormContext.js";
import { FormState } from "./FormState.js";
import { FormField } from "./FormField.js";

/**
 * BaseForm implementing state management, fields registrations, and changes handling loops.
 */
export abstract class BaseForm implements IForm {
  public state: FormState = FormState.Pristine;
  protected readonly fieldsMap = new Map<string, FormField>();

  constructor(public context: FormContext) {}

  public getFields(): FormField[] {
    return Array.from(this.fieldsMap.values());
  }

  public getField(name: string): FormField | undefined {
    return this.fieldsMap.get(name);
  }

  public setFieldValue(name: string, value: any): void {
    const field = this.fieldsMap.get(name);
    if (field) {
      field.setValue(value);
      this.state = FormState.Dirty;
      this.onFieldChange(name, value);
    }
  }

  protected onFieldChange(name: string, value: any): void {}

  public abstract validate(): Promise<boolean>;
  public abstract submit(): Promise<any>;

  public registerField(field: FormField): void {
    this.fieldsMap.set(field.name, field);
  }
}
