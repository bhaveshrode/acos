import { IStateStore } from "./IStateStore.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * StateStore implementing IStateStore, utilizing deep-frozen immutable updates and subscription notification.
 */
export class StateStore<S = any> implements IStateStore<S> {
  private state: S;
  private snapshot: StateSnapshot<S>;
  private readonly listeners = new Set<(state: S) => void>();

  constructor(initialState: S) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.snapshot = new StateSnapshot<S>(this.state);
  }

  public getState(): S {
    return this.state;
  }

  public getSnapshot(): StateSnapshot<S> {
    return this.snapshot;
  }

  public update(mutator: (state: S) => void): void {
    const copy = JSON.parse(JSON.stringify(this.state));
    mutator(copy);
    this.state = copy;
    this.snapshot = new StateSnapshot<S>(this.state);
    this.notify();
  }

  public subscribe(listener: (state: S) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
