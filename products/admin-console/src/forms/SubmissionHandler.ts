import { FormSubmission } from "./FormSubmission.js";
import { FormSubmissionResult } from "./FormSubmissionResult.js";

/**
 * SubmissionHandler executing submission callbacks.
 */
export class SubmissionHandler {
  constructor(private readonly submitFn: (submission: FormSubmission) => Promise<any>) {}

  public async execute(submission: FormSubmission): Promise<FormSubmissionResult> {
    try {
      const data = await this.submitFn(submission);
      return FormSubmissionResult.ok(data);
    } catch (e: any) {
      return FormSubmissionResult.fail(e.message || "Submission failed");
    }
  }
}
