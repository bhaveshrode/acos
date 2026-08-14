import { IRequest } from "../commands/IRequest.js";
import { IExecutionContext } from "../context/IExecutionContext.js";

/**
 * Interface representing a user access control policy checking request execution context.
 */
export interface IAuthPolicy<TRequest extends IRequest<any>> {
  /**
   * Evaluates if context details permit request authorization.
   */
  isAuthorized(request: TRequest, context: IExecutionContext): Promise<boolean>;
}
