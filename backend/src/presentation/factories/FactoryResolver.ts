import { FactoryRegistry } from "./FactoryRegistry.js";

/**
 * FactoryResolver resolving registered factory builders with contexts injections.
 */
export class FactoryResolver {
  constructor(private readonly context: any) {}

  public resolve<T>(key: string): T {
    const creator = FactoryRegistry.get(key);
    if (!creator) {
      throw new Error(`No creator registered for key: ${key}`);
    }
    return creator(this.context);
  }
}
