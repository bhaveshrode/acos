import { IStatePersistence } from "./IStatePersistence.js";
import { StateSnapshot } from "./StateSnapshot.js";
import { StateSerializer } from "./StateSerializer.js";

/**
 * LocalStorageStatePersistence saving snapshots to local storage.
 */
export class LocalStorageStatePersistence implements IStatePersistence {
  public save(key: string, snapshot: StateSnapshot): void {
    if (typeof localStorage !== "undefined") {
      const value = StateSerializer.serialize(snapshot);
      localStorage.setItem(key, value);
    }
  }

  public load<T>(key: string): StateSnapshot<T> | null {
    if (typeof localStorage !== "undefined") {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return StateSerializer.deserialize<T>(item);
    }
    return null;
  }

  public clear(key: string): void {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  }
}
