"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeResolver = void 0;
const ThemeMode_js_1 = require("./ThemeMode.js");
const ThemeConfiguration_js_1 = require("./ThemeConfiguration.js");
const ThemeTokens_js_1 = require("./ThemeTokens.js");
const ColorPalette_js_1 = require("./ColorPalette.js");
const TypographyTheme_js_1 = require("./TypographyTheme.js");
const SpacingTheme_js_1 = require("./SpacingTheme.js");
const ElevationTheme_js_1 = require("./ElevationTheme.js");
const ComponentTheme_js_1 = require("./ComponentTheme.js");
/**
 * ThemeResolver compiling the resolved ThemeConfiguration snapshot with grouped ThemeTokens.
 */
class ThemeResolver {
    detector;
    constructor(detector) {
        this.detector = detector;
    }
    resolve(mode) {
        let colors = ColorPalette_js_1.DarkPalette;
        if (mode === ThemeMode_js_1.ThemeMode.Light) {
            colors = ColorPalette_js_1.LightPalette;
        }
        else if (mode === ThemeMode_js_1.ThemeMode.System) {
            colors = this.detector.isDark() ? ColorPalette_js_1.DarkPalette : ColorPalette_js_1.LightPalette;
        }
        const tokens = new ThemeTokens_js_1.ThemeTokens(colors, TypographyTheme_js_1.DefaultTypography, SpacingTheme_js_1.DefaultSpacing, ElevationTheme_js_1.DefaultElevation, ComponentTheme_js_1.DefaultComponentTheme);
        return new ThemeConfiguration_js_1.ThemeConfiguration(tokens);
    }
}
exports.ThemeResolver = ThemeResolver;
