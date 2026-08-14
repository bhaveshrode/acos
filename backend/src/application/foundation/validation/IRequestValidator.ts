import { IRequest } from "../commands/IRequest.js";

/**
 * Interface representing a request parameters validation schema checker.
 */
export interface IRequestValidator<TRequest extends IRequest<any>> {
  /**
   * Evaluates request parameters structure and returns errors array.
   */
  validate(request: TRequest): string[];
}
