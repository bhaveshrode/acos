import { Result } from "../../foundation/result/Result.js";

export interface IMediator {
  send(request: any): Promise<any>;
}

/**
 * BaseController class acting as the common base for all REST controllers.
 */
export abstract class BaseController {
  protected constructor(protected readonly mediator: IMediator) {}

  protected ok<T>(data?: T) {
    return { status: 200, body: data };
  }

  protected created<T>(data?: T) {
    return { status: 201, body: data };
  }

  protected accepted<T>(data?: T) {
    return { status: 202, body: data };
  }

  protected noContent() {
    return { status: 204 };
  }

  protected badRequest(message: string) {
    return { status: 400, body: { error: message } };
  }

  protected unauthorized(message: string = "Unauthorized") {
    return { status: 401, body: { error: message } };
  }

  protected forbidden(message: string = "Forbidden") {
    return { status: 403, body: { error: message } };
  }

  protected notFound(message: string = "Not Found") {
    return { status: 404, body: { error: message } };
  }

  protected conflict(message: string = "Conflict") {
    return { status: 409, body: { error: message } };
  }

  protected internalError(message: string = "Internal Server Error") {
    return { status: 500, body: { error: message } };
  }

  /**
   * Translates application Command/Query results to unified HTTP responses.
   */
  protected async execute(request: any): Promise<any> {
    const res = await this.mediator.send(request);
    if (res instanceof Result) {
      if (res.isSuccess) {
        return this.ok(res.value);
      } else {
        return this.badRequest(res.error.message);
      }
    }
    return this.ok(res);
  }
}
