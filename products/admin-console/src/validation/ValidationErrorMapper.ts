import { ValidationErrorCollection } from "./ValidationErrorCollection.js";

/**
 * ValidationErrorMapper mapping detailed collections onto simple key-value templates.
 */
export class ValidationErrorMapper {
  public static mapToUi(collection: ValidationErrorCollection): Record<string, string> {
    const map: Record<string, string> = {};
    for (const error of collection.getAll()) {
      if (!map[error.property]) {
        map[error.property] = error.message;
      }
    }
    return map;
  }
}
