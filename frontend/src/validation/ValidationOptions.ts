/**
 * ValidationOptions specifying pipeline strategies and failFast policies.
 */
export interface ValidationOptions {
  strategy?: "onChange" | "onBlur" | "onSubmit";
  async?: boolean;
  failFast?: boolean;
  messageFormat?: string;
}
