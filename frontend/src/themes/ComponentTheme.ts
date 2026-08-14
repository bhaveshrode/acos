/**
 * ComponentTheme defining layout border radii and standard padding offsets.
 */
export interface ComponentTheme {
  borderRadius: string;
  buttonPadding: string;
  cardPadding: string;
}

export const DefaultComponentTheme: ComponentTheme = {
  borderRadius: "8px",
  buttonPadding: "0.5rem 1rem",
  cardPadding: "1.5rem"
};
