import { ComponentMetadata } from "./ComponentMetadata.js";

/**
 * ComponentDescriptor encapsulating component class registrations, metadata, and slot configuration maps.
 */
export class ComponentDescriptor {
  constructor(
    public readonly metadata: ComponentMetadata,
    public readonly componentClass: any,
    public readonly slots: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.slots);
    Object.freeze(this);
  }
}
