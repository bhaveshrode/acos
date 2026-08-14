import { IRequest } from "../commands/IRequest.js";

export type RequestHandlerDelegate<TResponse> = () => Promise<TResponse>;

/**
 * Middleware decorator contract for wrapping execution requests.
 */
export interface IPipelineBehavior<TRequest extends IRequest<TResponse>, TResponse> {
  /**
   * Pipeline behavior interceptor.
   */
  handle(
    request: TRequest,
    next: RequestHandlerDelegate<TResponse>
  ): Promise<TResponse>;
}
