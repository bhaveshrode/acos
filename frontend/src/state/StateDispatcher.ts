import { IStateStore } from "./IStateStore.js";
import { IActionHandler } from "./IActionHandler.js";

/**
 * StateDispatcher coordinates action mapping executions via IActionHandlers.
 */
export class StateDispatcher {
  constructor(private readonly store: IStateStore) {}

  public dispatch<A = any>(
    actionType: string,
    payload: A,
    handler: IActionHandler<any, A>
  ): void {
    this.store.update((state) => {
      handler.handle(state, { type: actionType, payload });
    });
  }
}
