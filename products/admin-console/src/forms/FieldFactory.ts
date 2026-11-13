import { FormField } from "./FormField.js";

/**
 * FieldFactory offering static builders to construct typed form fields.
 */
export class FieldFactory {
  public static createTextField(name: string, value: string = "", validators: any[] = []): FormField {
    return new FormField(name, value, "text", validators);
  }

  public static createNumberField(name: string, value: number = 0, validators: any[] = []): FormField {
    return new FormField(name, value, "number", validators);
  }

  public static createSelectField(name: string, value: any = "", validators: any[] = []): FormField {
    return new FormField(name, value, "select", validators);
  }

  public static createCheckboxField(name: string, value: boolean = false, validators: any[] = []): FormField {
    return new FormField(name, value, "checkbox", validators);
  }

  public static createDateField(name: string, value: string = "", validators: any[] = []): FormField {
    return new FormField(name, value, "date", validators);
  }

  public static createFileField(name: string, value: any = null, validators: any[] = []): FormField {
    return new FormField(name, value, "file", validators);
  }
}
