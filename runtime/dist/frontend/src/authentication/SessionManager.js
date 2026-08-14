"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const AuthenticationContext_js_1 = require("./AuthenticationContext.js");
const AuthenticationState_js_1 = require("./AuthenticationState.js");
/**
 * SessionManager coordinating active logins, logouts, state notifications, and token refresh thresholds.
 */
class SessionManager {
    sessionStore;
    options;
    context;
    listeners = new Set();
    constructor(sessionStore, options) {
        this.sessionStore = sessionStore;
        this.options = options;
        this.context = new AuthenticationContext_js_1.AuthenticationContext(AuthenticationState_js_1.AuthenticationState.Unauthenticated, options);
    }
    getContext() {
        return this.context;
    }
    setSession(session) {
        this.context = new AuthenticationContext_js_1.AuthenticationContext(AuthenticationState_js_1.AuthenticationState.Authenticated, this.options, session);
        if (this.options.rememberMe && this.options.storageKey) {
            this.sessionStore.save(this.options.storageKey, session);
        }
        this.notify();
    }
    clearSession() {
        this.context = new AuthenticationContext_js_1.AuthenticationContext(AuthenticationState_js_1.AuthenticationState.Unauthenticated, this.options);
        if (this.options.storageKey) {
            this.sessionStore.clear(this.options.storageKey);
        }
        this.notify();
    }
    setRefreshing() {
        this.context = new AuthenticationContext_js_1.AuthenticationContext(AuthenticationState_js_1.AuthenticationState.Refreshing, this.options, this.context.session);
        this.notify();
    }
    setExpired() {
        this.context = new AuthenticationContext_js_1.AuthenticationContext(AuthenticationState_js_1.AuthenticationState.Expired, this.options, this.context.session);
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
            listener(this.context);
        }
    }
}
exports.SessionManager = SessionManager;
