import { SubsystemRegistry } from "./SubsystemRegistry.js";

/**
 * SubsystemResolver resolving registered instances.
 */
export class SubsystemResolver {
  constructor(private readonly registry: SubsystemRegistry) {}

  public resolveFactory(name: string): any {
    const desc = this.registry.get(name);
    return desc?.factoryRef;
  }
}
