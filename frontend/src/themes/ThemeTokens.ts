import { ColorPalette } from "./ColorPalette.js";
import { TypographyTheme } from "./TypographyTheme.js";
import { SpacingTheme } from "./SpacingTheme.js";
import { ElevationTheme } from "./ElevationTheme.js";
import { ComponentTheme } from "./ComponentTheme.js";

/**
 * ThemeTokens encapsulating immutable design tokens values.
 */
export class ThemeTokens {
  constructor(
    public readonly colors: ColorPalette,
    public readonly typography: TypographyTheme,
    public readonly spacing: SpacingTheme,
    public readonly elevation: ElevationTheme,
    public readonly components: ComponentTheme
  ) {
    Object.freeze(this.colors);
    Object.freeze(this.typography);
    Object.freeze(this.spacing);
    Object.freeze(this.elevation);
    Object.freeze(this.components);
    Object.freeze(this);
  }
}
