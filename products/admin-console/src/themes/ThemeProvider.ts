import { ThemeContext } from "./ThemeContext.js";
import { ThemeManager } from "./ThemeManager.js";

/**
 * ThemeProvider exposing theme state values to layout component trees.
 */
export class ThemeProvider {
  constructor(private readonly manager: ThemeManager) {}

  public getTheme(): ThemeContext {
    return this.manager.getContext();
  }

  public subscribe(callback: (context: ThemeContext) => void): () => void {
    this.manager.onChange(callback);
    return () => {};
  }
}
