import { ComponentMetadata } from "./ComponentMetadata.js";

/**
 * ComponentContext carrying component configuration metadata and rendering services.
 */
export class ComponentContext {
  constructor(
    public readonly metadata: ComponentMetadata,
    public readonly services: Readonly<Record<string, any>> = {},
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.services);
    Object.freeze(this);
  }
}
