import { IRequest } from "../commands/IRequest.js";

/**
 * Interface representing a handler resolving a specific application IRequest.
 */
export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
  /**
   * Handles request processing.
   */
  handle(request: TRequest): Promise<TResponse>;
}
