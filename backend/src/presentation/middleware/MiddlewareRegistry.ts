import { IMiddleware } from "./IMiddleware.js";

/**
 * MiddlewareRegistry registering and tracking pipeline chains.
 */
export class MiddlewareRegistry {
  private static pipeline: IMiddleware[] = [];

  /**
   * Registers a middleware filter to the list.
   */
  public static register(middleware: IMiddleware): void {
    this.pipeline.push(middleware);
  }

  /**
   * Returns registered pipeline filters list.
   */
  public static getPipeline(): IMiddleware[] {
    return this.pipeline;
  }

  /**
   * Clears registry records.
   */
  public static clear(): void {
    this.pipeline = [];
  }
}
