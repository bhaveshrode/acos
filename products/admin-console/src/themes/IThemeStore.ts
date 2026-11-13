import { ThemeMode } from "./ThemeMode.js";

/**
 * IThemeStore interface contract for saving/loading styling preferences.
 */
export interface IThemeStore {
  saveTheme(mode: ThemeMode): void;
  loadTheme(): ThemeMode | null;
}
