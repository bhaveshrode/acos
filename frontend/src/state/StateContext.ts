import { StateOptions } from "./StateOptions.js";
import { StateRegistry } from "./StateRegistry.js";

/**
 * StateContext encapsulating configuration options and registries references.
 */
export class StateContext {
  constructor(
    public readonly options: StateOptions,
    public readonly registry: StateRegistry
  ) {
    Object.freeze(this);
  }
}
