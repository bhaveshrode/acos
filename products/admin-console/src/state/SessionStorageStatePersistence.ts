import { IStatePersistence } from "./IStatePersistence.js";
import { StateSnapshot } from "./StateSnapshot.js";
import { StateSerializer } from "./StateSerializer.js";

/**
 * SessionStorageStatePersistence saving snapshots to session storage.
 */
export class SessionStorageStatePersistence implements IStatePersistence {
  public save(key: string, snapshot: StateSnapshot): void {
    if (typeof sessionStorage !== "undefined") {
      const value = StateSerializer.serialize(snapshot);
      sessionStorage.setItem(key, value);
    }
  }

  public load<T>(key: string): StateSnapshot<T> | null {
    if (typeof sessionStorage !== "undefined") {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      return StateSerializer.deserialize<T>(item);
    }
    return null;
  }

  public clear(key: string): void {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(key);
    }
  }
}
