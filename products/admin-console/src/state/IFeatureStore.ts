import { StateSnapshot } from "./StateSnapshot.js";

/**
 * IFeatureStore generic contract interface defining features state containers behaviors.
 */
export interface IFeatureStore<TState> {
  getState(): TState;
  getSnapshot(): StateSnapshot<TState>;
  subscribe(listener: (state: TState) => void): () => void;
}
