import { StateSnapshot } from "./StateSnapshot.js";

/**
 * StateChange modelling mutations details including previous/current snapshots.
 */
export class StateChange<T = any> {
  constructor(
    public readonly previous: StateSnapshot<T> | null,
    public readonly current: StateSnapshot<T>,
    public readonly source?: string,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this);
  }
}
