import { RequestBinder } from "./RequestBinder.js";

/**
 * RequestRegistry cataloging reusable request binders mappings.
 */
export class RequestRegistry {
  private static binders = new Map<string, RequestBinder>();

  public static register(name: string, binder: RequestBinder): void {
    this.binders.set(name, binder);
  }

  public static get(name: string): RequestBinder | undefined {
    return this.binders.get(name);
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.binders.clear();
  }
}
