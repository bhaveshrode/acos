"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateDispatcher = void 0;
/**
 * StateDispatcher coordinates action mapping executions via IActionHandlers.
 */
class StateDispatcher {
    store;
    constructor(store) {
        this.store = store;
    }
    dispatch(actionType, payload, handler) {
        this.store.update((state) => {
            handler.handle(state, { type: actionType, payload });
        });
    }
}
exports.StateDispatcher = StateDispatcher;
