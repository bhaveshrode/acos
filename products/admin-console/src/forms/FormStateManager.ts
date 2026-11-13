import { IForm } from "./IForm.js";
import { FormState } from "./FormState.js";

/**
 * FormStateManager tracking form lifecycle transitions.
 */
export class FormStateManager {
  public transition(form: IForm, nextState: FormState): void {
    (form as any).state = nextState;
  }
}
