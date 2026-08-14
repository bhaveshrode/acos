import { IPipelineBehavior, RequestHandlerDelegate } from "./IPipelineBehavior.js";
import { IRequest } from "../commands/IRequest.js";
import { IRequestValidator } from "../validation/IRequestValidator.js";
import { ValidationException } from "../exceptions/ValidationException.js";

/**
 * Pipeline Behavior executing registered request validators before handler resolution.
 * Throws a ValidationException if errors are resolved.
 */
export class ValidationBehavior<TRequest extends IRequest<TResponse>, TResponse>
  implements IPipelineBehavior<TRequest, TResponse>
{
  private readonly validators = new Map<string, IRequestValidator<any>[]>();

  /**
   * Registers a validation schema check targeting a specific request class type.
   */
  public registerValidator<T extends IRequest<any>>(
    requestType: new (...args: any[]) => T,
    validator: IRequestValidator<T>
  ): void {
    const name = requestType.name;
    if (!this.validators.has(name)) {
      this.validators.set(name, []);
    }
    this.validators.get(name)!.push(validator);
  }

  public async handle(
    request: TRequest,
    next: RequestHandlerDelegate<TResponse>
  ): Promise<TResponse> {
    const requestName = request.constructor.name;
    const requestValidators = this.validators.get(requestName) || [];

    const errors: string[] = [];
    for (const val of requestValidators) {
      const valErrors = val.validate(request);
      errors.push(...valErrors);
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    return next();
  }
}
