/**
 * FormSubmission containing parameters of current submissions.
 */
export class FormSubmission {
  constructor(
    public readonly formId: string,
    public readonly payload: Readonly<Record<string, any>>,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.payload);
    Object.freeze(this);
  }
}
