import { FormMetadata } from "./FormMetadata.js";

/**
 * FormContext carrying current input values, active validation errors, and submission status.
 */
export class FormContext {
  constructor(
    public readonly metadata: FormMetadata,
    public readonly fieldsValues: Readonly<Record<string, any>> = {},
    public readonly errors: Readonly<Record<string, string>> = {},
    public readonly isSubmitting: boolean = false,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.fieldsValues);
    Object.freeze(this.errors);
    Object.freeze(this);
  }
}
