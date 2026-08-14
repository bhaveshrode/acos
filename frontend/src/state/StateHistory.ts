import { StateSnapshot } from "./StateSnapshot.js";

/**
 * StateHistory recording history trace lists logs.
 */
export class StateHistory {
  constructor(
    public readonly snapshots: StateSnapshot[] = []
  ) {}

  public add(snapshot: StateSnapshot): StateHistory {
    return new StateHistory([...this.snapshots, snapshot]);
  }
}
