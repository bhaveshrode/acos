import { StateRegistry } from "./StateRegistry.js";

/**
 * StateProvider exposing registered store context mappings.
 */
export class StateProvider {
  constructor(public readonly registry: StateRegistry) {}

  public getRegistry(): StateRegistry {
    return this.registry;
  }
}
