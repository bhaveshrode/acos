import { IForm } from "./IForm.js";
import { FormValidator } from "./FormValidator.js";
import { SubmissionHandler } from "./SubmissionHandler.js";
import { FormSubmission } from "./FormSubmission.js";
import { FormSubmissionResult } from "./FormSubmissionResult.js";

/**
 * SubmissionPipeline executing validation steps before invoking handlers.
 */
export class SubmissionPipeline {
  constructor(
    private readonly validator: FormValidator,
    private readonly handler: SubmissionHandler
  ) {}

  public async execute(form: IForm): Promise<FormSubmissionResult> {
    const valRes = await this.validator.validate(form);
    if (!valRes.isValid) {
      return FormSubmissionResult.fail("Validation checks failed");
    }

    const payload: Record<string, any> = {};
    for (const field of form.getFields()) {
      payload[field.name] = field.value;
    }

    const submission = new FormSubmission(form.context.metadata.id, payload);
    return await this.handler.execute(submission);
  }
}
