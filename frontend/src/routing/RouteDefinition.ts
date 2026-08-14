import { IRouteGuard } from "./IRouteGuard.js";

/**
 * RouteDefinition representing structure configurations of client routing paths.
 */
export interface RouteDefinition {
  path: string;
  name?: string;
  component?: any;
  layout?: string;
  guards?: IRouteGuard[];
  children?: RouteDefinition[];
  meta?: Record<string, any>;
}
