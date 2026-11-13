import { NavigationOptions } from "./NavigationOptions.js";

/**
 * INavigationManager interface contract defining browser or custom host history operations.
 */
export interface INavigationManager {
  navigate(path: string, options?: NavigationOptions): void;
  goBack(): void;
  goForward(): void;
  onPopState(callback: (path: string) => void): void;
}
