import { StateSnapshot } from "./StateSnapshot.js";

/**
 * StateSerializer providing static parsing utilities.
 */
export class StateSerializer {
  public static serialize(snapshot: StateSnapshot): string {
    return JSON.stringify({
      data: snapshot.data,
      timestamp: snapshot.timestamp
    });
  }

  public static deserialize<T>(serialized: string): StateSnapshot<T> {
    const parsed = JSON.parse(serialized);
    return new StateSnapshot<T>(parsed.data, parsed.timestamp);
  }
}
