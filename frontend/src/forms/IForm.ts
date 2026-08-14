import { FormContext } from "./FormContext.js";
import { FormState } from "./FormState.js";
import { FormField } from "./FormField.js";

/**
 * IForm interface defining form execution, validation, and submission contracts.
 */
export interface IForm {
  context: FormContext;
  state: FormState;
  getFields(): FormField[];
  getField(name: string): FormField | undefined;
  setFieldValue(name: string, value: any): void;
  validate(): Promise<boolean>;
  submit(): Promise<any>;
}
