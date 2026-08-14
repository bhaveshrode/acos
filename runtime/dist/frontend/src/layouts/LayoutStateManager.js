"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutStateManager = void 0;
/**
 * LayoutStateManager logging active transitions and structures configurations states.
 */
class LayoutStateManager {
    activeLayoutId;
    transitionTo(layoutId) {
        this.activeLayoutId = layoutId;
    }
    getActiveLayoutId() {
        return this.activeLayoutId;
    }
}
exports.LayoutStateManager = LayoutStateManager;
