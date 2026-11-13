import { IStateStore } from "./IStateStore.js";
import { SubscriptionToken } from "./SubscriptionToken.js";

/**
 * StateObserver wrapping subscriptions in Disposable SubscriptionTokens.
 */
export class StateObserver<S = any> {
  constructor(private readonly store: IStateStore<S>) {}

  public observe<T>(selector: (state: S) => T, callback: (value: T) => void): SubscriptionToken {
    let lastValue = selector(this.store.getState());
    const unsub = this.store.subscribe((state) => {
      const nextValue = selector(state);
      if (nextValue !== lastValue) {
        lastValue = nextValue;
        callback(nextValue);
      }
    });
    return new SubscriptionToken(unsub);
  }
}
