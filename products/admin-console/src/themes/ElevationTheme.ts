/**
 * ElevationTheme defining shadows values for layered layout elements.
 */
export interface ElevationTheme {
  none: string;
  low: string;
  medium: string;
  high: string;
}

export const DefaultElevation: ElevationTheme = {
  none: "none",
  low: "0 2px 4px rgba(0, 0, 0, 0.05)",
  medium: "0 4px 12px rgba(0, 0, 0, 0.08)",
  high: "0 8px 24px rgba(0, 0, 0, 0.12)"
};
