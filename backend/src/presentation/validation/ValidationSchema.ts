import { ValidationRule } from "./ValidationRule.js";

export interface SchemaField {
  rules: ValidationRule[];
}

/**
 * ValidationSchema declaring rules lists associated with dynamic request fields.
 */
export class ValidationSchema {
  constructor(public readonly fields: Record<string, SchemaField>) {}
}
