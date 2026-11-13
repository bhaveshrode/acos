import { StateDiff } from "./StateDiff.js";

/**
 * StateDiffCalculator providing calculations comparing snapshots states returning StateDiff.
 */
export class StateDiffCalculator {
  public static calculateDiff(prev: any, current: any): StateDiff {
    const added: Record<string, any> = {};
    const removed: Record<string, any> = {};
    const modified: Record<string, { from: any; to: any }> = {};

    if (!prev || !current) {
      return new StateDiff(added, removed, modified);
    }

    Object.keys(current).forEach((key) => {
      if (!(key in prev)) {
        added[key] = current[key];
      } else if (JSON.stringify(prev[key]) !== JSON.stringify(current[key])) {
        modified[key] = {
          from: prev[key],
          to: current[key]
        };
      }
    });

    Object.keys(prev).forEach((key) => {
      if (!(key in current)) {
        removed[key] = prev[key];
      }
    });

    return new StateDiff(added, removed, modified);
  }
}
