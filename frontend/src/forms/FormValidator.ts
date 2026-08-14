import { IForm } from "./IForm.js";
import { ValidationResult } from "./ValidationResult.js";
import { FieldValidator } from "./FieldValidator.js";

/**
 * FormValidator checking entire collections of form fields.
 */
export class FormValidator {
  public async validate(form: IForm): Promise<ValidationResult> {
    const errors: Record<string, string> = {};
    for (const field of form.getFields()) {
      const error = FieldValidator.validate(field);
      if (error) {
        field.error = error;
        errors[field.name] = error;
      } else {
        field.error = undefined;
      }
    }

    if (Object.keys(errors).length > 0) {
      return ValidationResult.failure(errors);
    }
    return ValidationResult.success();
  }
}
