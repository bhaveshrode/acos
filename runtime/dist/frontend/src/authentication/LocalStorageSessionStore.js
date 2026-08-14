"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageSessionStore = void 0;
const UserSession_js_1 = require("./UserSession.js");
/**
 * LocalStorageSessionStore persisting user sessions across browser sessions.
 */
class LocalStorageSessionStore {
    save(key, session) {
        if (typeof localStorage !== "undefined") {
            const serialized = JSON.stringify({
                userId: session.userId,
                username: session.username,
                token: session.token,
                claims: session.claims,
                expirationTime: session.expirationTime,
                refreshToken: session.refreshToken
            });
            localStorage.setItem(key, serialized);
        }
    }
    load(key) {
        if (typeof localStorage !== "undefined") {
            const data = localStorage.getItem(key);
            if (!data)
                return null;
            try {
                const p = JSON.parse(data);
                return new UserSession_js_1.UserSession(p.userId, p.username, p.token, p.claims, p.expirationTime, p.refreshToken);
            }
            catch {
                return null;
            }
        }
        return null;
    }
    clear(key) {
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(key);
        }
    }
}
exports.LocalStorageSessionStore = LocalStorageSessionStore;
