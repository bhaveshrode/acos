import { StateSnapshot } from "./StateSnapshot.js";

/**
 * IStateStore interface contract defining state storage, updates, and subscription hooks.
 */
export interface IStateStore<S = any> {
  getState(): S;
  update(mutator: (state: S) => void): void;
  subscribe(listener: (state: S) => void): () => void;
  getSnapshot(): StateSnapshot<S>;
}
