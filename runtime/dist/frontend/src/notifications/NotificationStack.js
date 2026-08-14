"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStack = void 0;
/**
 * NotificationStack organizing notifications by placement coordinates.
 */
class NotificationStack {
    placements = new Map();
    pushToPlacement(placement, notification) {
        if (!this.placements.has(placement)) {
            this.placements.set(placement, []);
        }
        this.placements.get(placement).push(notification);
    }
    getForPlacement(placement) {
        return this.placements.get(placement) || [];
    }
}
exports.NotificationStack = NotificationStack;
