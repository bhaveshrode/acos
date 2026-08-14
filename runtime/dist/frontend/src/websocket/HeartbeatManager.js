"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatManager = void 0;
/**
 * HeartbeatManager checking keep-alive signals on timers loops.
 */
class HeartbeatManager {
    intervalId;
    startHeartbeat(pingFn, intervalMs) {
        this.intervalId = setInterval(pingFn, intervalMs);
    }
    stopHeartbeat() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
exports.HeartbeatManager = HeartbeatManager;
