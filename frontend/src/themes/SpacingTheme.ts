/**
 * SpacingTheme defining standard sizing dimensions multipliers.
 */
export interface SpacingTheme {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export const DefaultSpacing: SpacingTheme = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem"
};
