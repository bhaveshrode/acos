import { IPipelineBehavior, RequestHandlerDelegate } from "./IPipelineBehavior.js";
import { IRequest } from "../commands/IRequest.js";
import { IUnitOfWork } from "../transactions/IUnitOfWork.js";

/**
 * Pipeline Behavior wrapping state-mutating Commands inside database transaction scopes.
 */
export class TransactionBehavior<TRequest extends IRequest<TResponse>, TResponse>
  implements IPipelineBehavior<TRequest, TResponse>
{
  constructor(private readonly unitOfWork: IUnitOfWork) {}

  public async handle(
    request: TRequest,
    next: RequestHandlerDelegate<TResponse>
  ): Promise<TResponse> {
    const requestName = request.constructor.name;
    // Apply transactional logic strictly to Commands (mutations)
    const isCommand = requestName.toLowerCase().endsWith("command");

    if (!isCommand) {
      return next();
    }

    await this.unitOfWork.begin();
    try {
      const response = await next();
      await this.unitOfWork.commit();
      return response;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
