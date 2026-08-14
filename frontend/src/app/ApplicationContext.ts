import { ApplicationOptions } from "./ApplicationOptions.js";
import { ApplicationState } from "./ApplicationState.js";

/**
 * ApplicationContext carrying global runtime options, states, and registries.
 */
export class ApplicationContext {
  constructor(
    public readonly options: ApplicationOptions,
    public readonly state: ApplicationState,
    public readonly services: Map<string, any> = new Map()
  ) {}

  public registerService(name: string, service: any): void {
    this.services.set(name, service);
  }

  public getService<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in ApplicationContext`);
    }
    return service as T;
  }
}
