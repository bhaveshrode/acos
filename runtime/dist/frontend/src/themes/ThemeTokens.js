"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeTokens = void 0;
/**
 * ThemeTokens encapsulating immutable design tokens values.
 */
class ThemeTokens {
    colors;
    typography;
    spacing;
    elevation;
    components;
    constructor(colors, typography, spacing, elevation, components) {
        this.colors = colors;
        this.typography = typography;
        this.spacing = spacing;
        this.elevation = elevation;
        this.components = components;
        Object.freeze(this.colors);
        Object.freeze(this.typography);
        Object.freeze(this.spacing);
        Object.freeze(this.elevation);
        Object.freeze(this.components);
        Object.freeze(this);
    }
}
exports.ThemeTokens = ThemeTokens;
