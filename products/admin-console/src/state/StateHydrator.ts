import { IStateStore } from "./IStateStore.js";
import { IStatePersistence } from "./IStatePersistence.js";
import { HydrationResult } from "./HydrationResult.js";

/**
 * StateHydrator loading snapshots values from persistence and returning a HydrationResult.
 */
export class StateHydrator {
  constructor(private readonly persistence: IStatePersistence) {}

  public hydrate<T>(key: string, store: IStateStore<T>): HydrationResult {
    try {
      const snapshot = this.persistence.load<T>(key);
      if (snapshot) {
        store.update((state) => {
          Object.assign(state as any, snapshot.data);
        });
        return HydrationResult.success();
      }
      return HydrationResult.failed("No snapshot found in storage");
    } catch (err: any) {
      return HydrationResult.failed(err.message || "Deserialization failure");
    }
  }
}
