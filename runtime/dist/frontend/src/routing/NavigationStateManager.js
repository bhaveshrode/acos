"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationStateManager = void 0;
/**
 * NavigationStateManager managing transition payload states.
 */
class NavigationStateManager {
    state = {};
    setState(state) {
        this.state = { ...state };
    }
    getState() {
        return { ...this.state };
    }
    clear() {
        this.state = {};
    }
}
exports.NavigationStateManager = NavigationStateManager;
