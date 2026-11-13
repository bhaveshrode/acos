import { ThemeMode } from "./ThemeMode.js";
import { ThemeConfiguration } from "./ThemeConfiguration.js";

/**
 * ThemeContext representing active styling states snapshots.
 */
export class ThemeContext {
  constructor(
    public readonly mode: ThemeMode,
    public readonly config: ThemeConfiguration
  ) {
    Object.freeze(this);
  }
}
