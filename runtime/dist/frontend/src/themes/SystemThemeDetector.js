"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemThemeDetector = void 0;
/**
 * SystemThemeDetector observing OS theme color preferences changes.
 */
class SystemThemeDetector {
    listeners = [];
    constructor() {
        if (typeof window !== "undefined" && window.matchMedia) {
            const query = window.matchMedia("(prefers-color-scheme: dark)");
            query.addEventListener("change", (e) => {
                this.notify(e.matches);
            });
        }
    }
    isDark() {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    }
    onThemeChange(callback) {
        this.listeners.push(callback);
    }
    notify(isDark) {
        for (const listener of this.listeners) {
            listener(isDark);
        }
    }
}
exports.SystemThemeDetector = SystemThemeDetector;
