import { ThemeMode } from "./ThemeMode.js";
import { IThemeStore } from "./IThemeStore.js";

/**
 * ThemeStore implementing standard storage save/load options hooks.
 */
export class ThemeStore implements IThemeStore {
  constructor(private readonly persistKey: string = "acos_theme_mode") {}

  public saveTheme(mode: ThemeMode): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.persistKey, mode);
    }
  }

  public loadTheme(): ThemeMode | null {
    if (typeof localStorage !== "undefined") {
      const item = localStorage.getItem(this.persistKey);
      if (item && Object.values(ThemeMode).includes(item as ThemeMode)) {
        return item as ThemeMode;
      }
    }
    return null;
  }
}
