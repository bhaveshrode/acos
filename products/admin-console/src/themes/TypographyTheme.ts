/**
 * TypographyTheme defining typeface weights, families, and sizing factors.
 */
export interface TypographyTheme {
  fontFamily: string;
  fontSizeBase: string;
  fontWeightLight: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  lineHeightNormal: string;
}

export const DefaultTypography: TypographyTheme = {
  fontFamily: "'Outfit', 'Inter', sans-serif",
  fontSizeBase: "16px",
  fontWeightLight: "300",
  fontWeightNormal: "400",
  fontWeightMedium: "500",
  fontWeightBold: "700",
  lineHeightNormal: "1.5"
};
