"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = void 0;
/**
 * ThemeProvider exposing theme state values to layout component trees.
 */
class ThemeProvider {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    getTheme() {
        return this.manager.getContext();
    }
    subscribe(callback) {
        this.manager.onChange(callback);
        return () => { };
    }
}
exports.ThemeProvider = ThemeProvider;
