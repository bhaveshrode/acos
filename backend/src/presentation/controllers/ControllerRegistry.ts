import { BaseController } from "./BaseController.js";

/**
 * ControllerRegistry catalog class maintaining dynamic routes controllers pointers.
 */
export class ControllerRegistry {
  private static registry = new Map<string, BaseController>();

  /**
   * Registers a controller instance to the registry map.
   */
  public static register(name: string, controller: BaseController): void {
    this.registry.set(name, controller);
  }

  /**
   * Returns a resolved controller instance by name.
   */
  public static resolve(name: string): BaseController {
    const controller = this.registry.get(name);
    if (!controller) {
      throw new Error(`Controller '${name}' is not registered.`);
    }
    return controller;
  }

  /**
   * Lists registered controller names.
   */
  public static getControllers(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Resets active registries.
   */
  public static clear(): void {
    this.registry.clear();
  }
}
