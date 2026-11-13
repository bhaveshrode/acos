import { IStateStore } from "./IStateStore.js";

/**
 * StateRegistry cataloging all registered feature stores, preventing mutations after boot.
 */
export class StateRegistry {
  private readonly stores = new Map<string, IStateStore>();
  private isFrozen: boolean = false;

  public register(name: string, store: IStateStore): void {
    if (this.isFrozen) {
      throw new Error("StateRegistry is frozen and cannot accept further stores");
    }
    this.stores.set(name, store);
  }

  public getStore<T = any>(name: string): IStateStore<T> | undefined {
    return this.stores.get(name) as IStateStore<T>;
  }

  public freeze(): void {
    this.isFrozen = true;
  }

  public clear(): void {
    if (this.isFrozen) {
      throw new Error("StateRegistry is frozen and cannot be cleared");
    }
    this.stores.clear();
  }
}
