import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * IMiddleware contract interface.
 */
export interface IMiddleware {
  handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void>;
}
