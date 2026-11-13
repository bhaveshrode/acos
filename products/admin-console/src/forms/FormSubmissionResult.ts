/**
 * FormSubmissionResult wrapping submission responses and errors.
 */
export class FormSubmissionResult {
  private constructor(
    public readonly success: boolean,
    public readonly data?: any,
    public readonly error?: string
  ) {
    Object.freeze(this);
  }

  public static ok(data?: any): FormSubmissionResult {
    return new FormSubmissionResult(true, data);
  }

  public static fail(error: string): FormSubmissionResult {
    return new FormSubmissionResult(false, undefined, error);
  }
}
