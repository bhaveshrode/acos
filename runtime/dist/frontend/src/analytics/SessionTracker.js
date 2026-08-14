"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionTracker = void 0;
/**
 * SessionTracker monitoring user sessions.
 */
class SessionTracker {
    activeSessionId;
    lastActivityTime = Date.now();
    startSession(sessionId) {
        this.activeSessionId = sessionId;
        this.lastActivityTime = Date.now();
    }
    recordActivity() {
        this.lastActivityTime = Date.now();
    }
    getSessionId() {
        return this.activeSessionId;
    }
    getLastActivityTime() {
        return this.lastActivityTime;
    }
}
exports.SessionTracker = SessionTracker;
