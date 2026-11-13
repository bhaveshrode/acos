import { StateSnapshot } from "./StateSnapshot.js";

/**
 * IStatePersistence interface contract for saving/loading snapshots data.
 */
export interface IStatePersistence {
  save(key: string, snapshot: StateSnapshot): void;
  load<T>(key: string): StateSnapshot<T> | null;
  clear(key: string): void;
}
