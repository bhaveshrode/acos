"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
const ThemeMode_js_1 = require("./ThemeMode.js");
const ThemeContext_js_1 = require("./ThemeContext.js");
/**
 * ThemeManager coordinating active theme selections using the abstracted IThemeStore.
 */
class ThemeManager {
    options;
    resolver;
    store;
    detector;
    currentMode;
    listeners = [];
    constructor(options, resolver, store, detector) {
        this.options = options;
        this.resolver = resolver;
        this.store = store;
        this.detector = detector;
        this.currentMode = this.store.loadTheme() || this.options.defaultMode;
        this.detector.onThemeChange(() => {
            if (this.currentMode === ThemeMode_js_1.ThemeMode.System) {
                this.notify();
            }
        });
    }
    getContext() {
        const config = this.resolver.resolve(this.currentMode);
        return new ThemeContext_js_1.ThemeContext(this.currentMode, config);
    }
    setMode(mode) {
        this.currentMode = mode;
        this.store.saveTheme(mode);
        this.notify();
    }
    getMode() {
        return this.currentMode;
    }
    onChange(callback) {
        this.listeners.push(callback);
    }
    notify() {
        const context = this.getContext();
        for (const listener of this.listeners) {
            listener(context);
        }
    }
}
exports.ThemeManager = ThemeManager;
