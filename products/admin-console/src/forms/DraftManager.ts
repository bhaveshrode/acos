import { IForm } from "./IForm.js";
import { FormSerializer } from "./FormSerializer.js";

/**
 * DraftManager managing local form drafts storage.
 */
export class DraftManager {
  constructor(private readonly serializer: FormSerializer) {}

  public saveDraft(form: IForm): void {
    const serialized = this.serializer.serialize(form);
    localStorage.setItem(`acos:form_draft:${form.context.metadata.id}`, serialized);
  }

  public getDraft(formId: string): string | null {
    return localStorage.getItem(`acos:form_draft:${formId}`);
  }

  public clearDraft(formId: string): void {
    localStorage.removeItem(`acos:form_draft:${formId}`);
  }
}
