import { ThemeMode } from "./ThemeMode.js";

/**
 * ThemeOptions representing styling preferences customizations options.
 */
export interface ThemeOptions {
  defaultMode: ThemeMode;
  persistKey?: string;
  enableTransitions?: boolean;
}
