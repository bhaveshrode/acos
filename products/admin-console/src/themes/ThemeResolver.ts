import { ThemeMode } from "./ThemeMode.js";
import { ThemeConfiguration } from "./ThemeConfiguration.js";
import { ThemeTokens } from "./ThemeTokens.js";
import { DarkPalette, LightPalette } from "./ColorPalette.js";
import { DefaultTypography } from "./TypographyTheme.js";
import { DefaultSpacing } from "./SpacingTheme.js";
import { DefaultElevation } from "./ElevationTheme.js";
import { DefaultComponentTheme } from "./ComponentTheme.js";
import { SystemThemeDetector } from "./SystemThemeDetector.js";

/**
 * ThemeResolver compiling the resolved ThemeConfiguration snapshot with grouped ThemeTokens.
 */
export class ThemeResolver {
  constructor(private readonly detector: SystemThemeDetector) {}

  public resolve(mode: ThemeMode): ThemeConfiguration {
    let colors = DarkPalette;

    if (mode === ThemeMode.Light) {
      colors = LightPalette;
    } else if (mode === ThemeMode.System) {
      colors = this.detector.isDark() ? DarkPalette : LightPalette;
    }

    const tokens = new ThemeTokens(
      colors,
      DefaultTypography,
      DefaultSpacing,
      DefaultElevation,
      DefaultComponentTheme
    );

    return new ThemeConfiguration(tokens);
  }
}
