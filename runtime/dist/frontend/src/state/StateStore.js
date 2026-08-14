"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStore = void 0;
const StateSnapshot_js_1 = require("./StateSnapshot.js");
/**
 * StateStore implementing IStateStore, utilizing deep-frozen immutable updates and subscription notification.
 */
class StateStore {
    state;
    snapshot;
    listeners = new Set();
    constructor(initialState) {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.snapshot = new StateSnapshot_js_1.StateSnapshot(this.state);
    }
    getState() {
        return this.state;
    }
    getSnapshot() {
        return this.snapshot;
    }
    update(mutator) {
        const copy = JSON.parse(JSON.stringify(this.state));
        mutator(copy);
        this.state = copy;
        this.snapshot = new StateSnapshot_js_1.StateSnapshot(this.state);
        this.notify();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }
}
exports.StateStore = StateStore;
