import { IForm } from "./IForm.js";
import { FormSerializer } from "./FormSerializer.js";
import { DraftManager } from "./DraftManager.js";
import { FormState } from "./FormState.js";

/**
 * FormHydrator restoring form drafts payloads back to active inputs.
 */
export class FormHydrator {
  constructor(
    private readonly serializer: FormSerializer,
    private readonly draftManager: DraftManager
  ) {}

  public hydrate(form: IForm): boolean {
    const draft = this.draftManager.getDraft(form.context.metadata.id);
    if (!draft) return false;

    try {
      const data = this.serializer.deserialize(draft);
      for (const [key, val] of Object.entries(data.values)) {
        form.setFieldValue(key, val);
      }
      (form as any).state = data.state as FormState;
      return true;
    } catch {
      return false;
    }
  }
}
