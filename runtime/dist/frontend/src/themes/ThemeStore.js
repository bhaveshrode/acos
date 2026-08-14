"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeStore = void 0;
const ThemeMode_js_1 = require("./ThemeMode.js");
/**
 * ThemeStore implementing standard storage save/load options hooks.
 */
class ThemeStore {
    persistKey;
    constructor(persistKey = "acos_theme_mode") {
        this.persistKey = persistKey;
    }
    saveTheme(mode) {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(this.persistKey, mode);
        }
    }
    loadTheme() {
        if (typeof localStorage !== "undefined") {
            const item = localStorage.getItem(this.persistKey);
            if (item && Object.values(ThemeMode_js_1.ThemeMode).includes(item)) {
                return item;
            }
        }
        return null;
    }
}
exports.ThemeStore = ThemeStore;
