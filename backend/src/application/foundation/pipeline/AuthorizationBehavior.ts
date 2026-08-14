import { IPipelineBehavior, RequestHandlerDelegate } from "./IPipelineBehavior.js";
import { IRequest } from "../commands/IRequest.js";
import { IExecutionContext } from "../context/IExecutionContext.js";
import { IAuthPolicy } from "../authorization/IAuthPolicy.js";
import { AuthorizationException } from "../exceptions/AuthorizationException.js";

/**
 * Pipeline Behavior verifying execution permission policies against current ExecutionContext.
 * Throws an AuthorizationException if checks fail.
 */
export class AuthorizationBehavior<TRequest extends IRequest<TResponse>, TResponse>
  implements IPipelineBehavior<TRequest, TResponse>
{
  private readonly policies = new Map<string, IAuthPolicy<any>[]>();

  constructor(private readonly contextProvider: () => IExecutionContext) {}

  /**
   * Registers an access policy targeting a specific request class type.
   */
  public registerPolicy<T extends IRequest<any>>(
    requestType: new (...args: any[]) => T,
    policy: IAuthPolicy<T>
  ): void {
    const name = requestType.name;
    if (!this.policies.has(name)) {
      this.policies.set(name, []);
    }
    this.policies.get(name)!.push(policy);
  }

  public async handle(
    request: TRequest,
    next: RequestHandlerDelegate<TResponse>
  ): Promise<TResponse> {
    const requestName = request.constructor.name;
    const requestPolicies = this.policies.get(requestName) || [];
    const context = this.contextProvider();

    for (const policy of requestPolicies) {
      const authorized = await policy.isAuthorized(request, context);
      if (!authorized) {
        throw new AuthorizationException(
          `Authorization check failed: User does not satisfy required policy for request: ${requestName}`
        );
      }
    }

    return next();
  }
}
