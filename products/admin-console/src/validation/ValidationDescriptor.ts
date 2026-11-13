import { ValidationSchema } from "./ValidationSchema.js";

/**
 * ValidationDescriptor encapsulating schemas and metadata.
 */
export class ValidationDescriptor {
  constructor(
    public readonly id: string,
    public readonly schema: ValidationSchema,
    public readonly metadata: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.metadata);
    Object.freeze(this);
  }
}
