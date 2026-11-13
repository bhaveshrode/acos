import { FormMetadata } from "./FormMetadata.js";

/**
 * FormDescriptor encapsulating form metadata, class mappings, and fields definitions.
 */
export class FormDescriptor {
  constructor(
    public readonly metadata: FormMetadata,
    public readonly formClass: any,
    public readonly fieldsList: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.fieldsList);
    Object.freeze(this);
  }
}
