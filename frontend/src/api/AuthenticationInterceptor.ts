import { IApiInterceptor } from "./IApiInterceptor.js";
import { ApiRequest } from "./ApiRequest.js";
import { AuthenticationHandler } from "./AuthenticationHandler.js";

/**
 * AuthenticationInterceptor appending authorization credentials.
 */
export class AuthenticationInterceptor implements IApiInterceptor {
  constructor(private readonly handler: AuthenticationHandler) {}

  public async interceptRequest(request: ApiRequest): Promise<ApiRequest> {
    return this.handler.attachToken(request);
  }
}
