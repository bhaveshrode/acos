"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeContext = void 0;
/**
 * ThemeContext representing active styling states snapshots.
 */
class ThemeContext {
    mode;
    config;
    constructor(mode, config) {
        this.mode = mode;
        this.config = config;
        Object.freeze(this);
    }
}
exports.ThemeContext = ThemeContext;
