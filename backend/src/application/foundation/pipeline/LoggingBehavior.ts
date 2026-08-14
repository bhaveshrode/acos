import { IPipelineBehavior, RequestHandlerDelegate } from "./IPipelineBehavior.js";
import { IRequest } from "../commands/IRequest.js";
import { ILogger } from "../../../foundation/contracts/system/ILogger.js";

/**
 * Pipeline Behavior that logs use-case request execution timings and parameters.
 */
export class LoggingBehavior<TRequest extends IRequest<TResponse>, TResponse>
  implements IPipelineBehavior<TRequest, TResponse>
{
  constructor(private readonly logger: ILogger) {}

  public async handle(
    request: TRequest,
    next: RequestHandlerDelegate<TResponse>
  ): Promise<TResponse> {
    const requestName = request.constructor.name;
    this.logger.info(`[Mediator] Processing request: ${requestName}`, { request });

    const startTime = Date.now();
    try {
      const response = await next();
      const elapsed = Date.now() - startTime;
      this.logger.info(`[Mediator] Finished request: ${requestName} in ${elapsed}ms`);
      return response;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      this.logger.error(`[Mediator] Request exception: ${requestName} in ${elapsed}ms`, error);
      throw error;
    }
  }
}
