import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * MiddlewarePipeline coordinating the sequential execution of middlewares.
 */
export class MiddlewarePipeline {
  private middlewares: IMiddleware[] = [];

  /**
   * Appends a middleware interceptor to the chain.
   */
  public use(middleware: IMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Sequentially executes registered middlewares.
   */
  public async execute(context: MiddlewareContext, target: () => Promise<void>): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const current = this.middlewares[index++];
        await current.handle(context, next);
      } else {
        await target();
      }
    };

    await next();
  }
}
