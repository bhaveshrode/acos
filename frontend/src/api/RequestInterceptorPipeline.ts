import { IApiInterceptor } from "./IApiInterceptor.js";
import { ApiRequest } from "./ApiRequest.js";

/**
 * RequestInterceptorPipeline running request filters.
 */
export class RequestInterceptorPipeline {
  constructor(private readonly interceptors: IApiInterceptor[] = []) {}

  public async execute(request: ApiRequest): Promise<ApiRequest> {
    let current = request;
    for (const interceptor of this.interceptors) {
      if (interceptor.interceptRequest) {
        current = await interceptor.interceptRequest(current);
      }
    }
    return current;
  }
}
