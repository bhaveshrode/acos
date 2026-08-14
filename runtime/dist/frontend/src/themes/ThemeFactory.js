"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeFactory = void 0;
const ThemeResolver_js_1 = require("./ThemeResolver.js");
const ThemeStore_js_1 = require("./ThemeStore.js");
const SystemThemeDetector_js_1 = require("./SystemThemeDetector.js");
const ThemeManager_js_1 = require("./ThemeManager.js");
const ThemeProvider_js_1 = require("./ThemeProvider.js");
/**
 * ThemeFactory building resolvers, stores, managers, and providers.
 */
class ThemeFactory {
    static createDetector() {
        return new SystemThemeDetector_js_1.SystemThemeDetector();
    }
    static createResolver(detector) {
        return new ThemeResolver_js_1.ThemeResolver(detector);
    }
    static createStore(persistKey) {
        return new ThemeStore_js_1.ThemeStore(persistKey);
    }
    static createManager(options, resolver, store, detector) {
        return new ThemeManager_js_1.ThemeManager(options, resolver, store, detector);
    }
    static createProvider(manager) {
        return new ThemeProvider_js_1.ThemeProvider(manager);
    }
}
exports.ThemeFactory = ThemeFactory;
