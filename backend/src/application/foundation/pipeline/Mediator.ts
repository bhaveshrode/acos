import { IRequest } from "../commands/IRequest.js";
import { IRequestHandler } from "../handlers/IRequestHandler.js";
import { IPipelineBehavior } from "./IPipelineBehavior.js";

/**
 * Reusable Mediator coordinating handler resolution and pipeline behavior middleware chains.
 */
export class Mediator {
  private readonly handlers = new Map<string, IRequestHandler<any, any>>();
  private readonly behaviors: IPipelineBehavior<any, any>[] = [];

  /**
   * Registers a use-case command or query request handler.
   */
  public registerHandler<TRequest extends IRequest<TResponse>, TResponse>(
    requestType: new (...args: any[]) => TRequest,
    handler: IRequestHandler<TRequest, TResponse>
  ): void {
    this.handlers.set(requestType.name, handler);
  }

  /**
   * Appends an interceptor middleware behavior to the execution chain.
   */
  public addBehavior(behavior: IPipelineBehavior<any, any>): void {
    this.behaviors.push(behavior);
  }

  /**
   * Dispatches the request through registered behaviors and resolved handler.
   */
  public async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
    const requestName = request.constructor.name;
    const handler = this.handlers.get(requestName);
    if (!handler) {
      throw new Error(`Handler not registered for request type: ${requestName}`);
    }

    let index = 0;
    const next = async (): Promise<TResponse> => {
      if (index < this.behaviors.length) {
        const behavior = this.behaviors[index++];
        // Call next recursively to process subsequent decorators
        return behavior.handle(request, next);
      }
      return handler.handle(request);
    };

    return next();
  }
}
