/**
 * NavigationOptions directing transitions behaviors.
 */
export interface NavigationOptions {
  replace?: boolean;
  state?: Record<string, any>;
  scrollRestoration?: "auto" | "manual";
}
