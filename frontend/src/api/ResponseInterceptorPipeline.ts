import { IApiInterceptor } from "./IApiInterceptor.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * ResponseInterceptorPipeline running response filters.
 */
export class ResponseInterceptorPipeline {
  constructor(private readonly interceptors: IApiInterceptor[] = []) {}

  public async execute(response: ApiResponse<any>): Promise<ApiResponse<any>> {
    let current = response;
    for (const interceptor of this.interceptors) {
      if (interceptor.interceptResponse) {
        current = await interceptor.interceptResponse(current);
      }
    }
    return current;
  }
}
