"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeConfiguration = void 0;
/**
 * ThemeConfiguration wrapping immutable styling snapshots.
 */
class ThemeConfiguration {
    tokens;
    constructor(tokens) {
        this.tokens = tokens;
        Object.freeze(this);
    }
}
exports.ThemeConfiguration = ThemeConfiguration;
