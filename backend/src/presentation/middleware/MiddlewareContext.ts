/**
 * MiddlewareContext wrapping request, response, and intermediate state properties.
 */
export interface MiddlewareContext {
  req: any;
  res: any;
  state: Record<string, any>;
}
