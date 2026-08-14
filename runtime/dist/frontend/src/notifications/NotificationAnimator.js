"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAnimator = void 0;
/**
 * NotificationAnimator coordinating entry/exit animation checks.
 */
class NotificationAnimator {
    isAnimating = false;
    animate(animationFn) {
        this.isAnimating = true;
        animationFn();
        this.isAnimating = false;
    }
    getIsAnimating() {
        return this.isAnimating;
    }
}
exports.NotificationAnimator = NotificationAnimator;
