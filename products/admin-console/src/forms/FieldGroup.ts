import { FormField } from "./FormField.js";

/**
 * FieldGroup organizing related form fields into logical sections.
 */
export class FieldGroup {
  constructor(
    public readonly name: string,
    public readonly fields: FormField[] = []
  ) {
    Object.freeze(this);
  }
}
