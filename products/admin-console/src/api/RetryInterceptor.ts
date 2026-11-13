import { IApiInterceptor } from "./IApiInterceptor.js";
import { ApiResponse } from "./ApiResponse.js";
import { IRetryPolicy } from "./IRetryPolicy.js";
import { NoRetryPolicy } from "./NoRetryPolicy.js";

/**
 * RetryInterceptor utilizing a decoupled IRetryPolicy abstraction strategy.
 */
export class RetryInterceptor implements IApiInterceptor {
  constructor(private readonly policy: IRetryPolicy = new NoRetryPolicy()) {}

  public async interceptResponse(response: ApiResponse<any>): Promise<ApiResponse<any>> {
    return response;
  }

  public getPolicy(): IRetryPolicy {
    return this.policy;
  }
}
