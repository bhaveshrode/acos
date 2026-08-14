import { RouteContext } from "./RouteContext.js";
import { NavigationOptions } from "./NavigationOptions.js";

/**
 * IRouter interface contract defining routing behaviors.
 */
export interface IRouter {
  start(initialPath?: string): Promise<void>;
  navigate(path: string, options?: NavigationOptions): Promise<void>;
  getCurrentContext(): RouteContext | undefined;
  onRouteChanged(callback: (context: RouteContext) => void): void;
}
