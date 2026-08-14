/**
 * StateUpdater supporting static deep-copied immutable transformations.
 */
export class StateUpdater {
  public static update<S>(state: S, mutator: (draft: S) => void): S {
    const copy = JSON.parse(JSON.stringify(state));
    mutator(copy);
    return copy;
  }
}
