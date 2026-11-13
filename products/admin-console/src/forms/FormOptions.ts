/**
 * FormOptions specifying validation policies and autoSave flags.
 */
export interface FormOptions {
  validationStrategy?: "onChange" | "onBlur" | "onSubmit";
  autoSave?: boolean;
  clearOnSubmit?: boolean;
}
