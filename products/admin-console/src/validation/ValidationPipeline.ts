import { ValidationSchema } from "./ValidationSchema.js";
import { ObjectValidator } from "./ObjectValidator.js";
import { ValidationResult } from "./ValidationResult.js";
import { ValidationDecision } from "./ValidationDecision.js";

/**
 * ValidationPipeline coordinating rule validations execution.
 */
export class ValidationPipeline {
  constructor(private readonly objectValidator: ObjectValidator) {}

  public async execute(
    target: Record<string, any>,
    schema: ValidationSchema,
    context?: any
  ): Promise<ValidationResult> {
    const errors = await this.objectValidator.validateObject(target, schema, context);
    if (Object.keys(errors).length > 0) {
      return ValidationResult.failure(errors);
    }
    return ValidationResult.success();
  }

  public async executeDecision(
    target: Record<string, any>,
    schema: ValidationSchema,
    context?: any
  ): Promise<ValidationDecision> {
    const errors = await this.objectValidator.validateObject(target, schema, context);
    const failedRules: string[] = [];
    for (const [prop, error] of Object.entries(errors)) {
      failedRules.push(`${prop}: ${error}`);
    }
    return new ValidationDecision(failedRules.length === 0, failedRules, {
      timestamp: Date.now()
    });
  }
}
