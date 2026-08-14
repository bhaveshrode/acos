"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionHydrator = void 0;
/**
 * SessionHydrator restoring saved sessions during startup bootstraps.
 */
class SessionHydrator {
    sessionStore;
    constructor(sessionStore) {
        this.sessionStore = sessionStore;
    }
    hydrate(key, manager) {
        try {
            const session = this.sessionStore.load(key);
            if (session && !session.isExpired()) {
                manager.setSession(session);
                return true;
            }
        }
        catch {
            this.sessionStore.clear(key);
        }
        return false;
    }
}
exports.SessionHydrator = SessionHydrator;
