"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageTransitionManager = void 0;
/**
 * PageTransitionManager tracking page entry and exit transition cycles.
 */
class PageTransitionManager {
    isTransitioning = false;
    async transitionTo(transitionFn) {
        this.isTransitioning = true;
        await transitionFn();
        this.isTransitioning = false;
    }
    getIsTransitioning() {
        return this.isTransitioning;
    }
}
exports.PageTransitionManager = PageTransitionManager;
