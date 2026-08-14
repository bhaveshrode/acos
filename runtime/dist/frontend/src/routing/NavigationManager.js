"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationManager = void 0;
/**
 * NavigationManager coordinating history state and programmatic page transitions.
 */
class NavigationManager {
    historyListeners = [];
    constructor() {
        if (typeof window !== "undefined") {
            window.addEventListener("popstate", () => {
                this.notifyListeners(window.location.pathname + window.location.search);
            });
        }
    }
    navigate(path, options) {
        if (typeof window !== "undefined") {
            const state = options?.state || {};
            if (options?.replace) {
                window.history.replaceState(state, "", path);
            }
            else {
                window.history.pushState(state, "", path);
            }
            if (options?.scrollRestoration) {
                window.history.scrollRestoration = options.scrollRestoration;
            }
            this.notifyListeners(path);
        }
    }
    goBack() {
        if (typeof window !== "undefined") {
            window.history.back();
        }
    }
    goForward() {
        if (typeof window !== "undefined") {
            window.history.forward();
        }
    }
    onPopState(callback) {
        this.historyListeners.push(callback);
    }
    notifyListeners(path) {
        for (const listener of this.historyListeners) {
            listener(path);
        }
    }
}
exports.NavigationManager = NavigationManager;
