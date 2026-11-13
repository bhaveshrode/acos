import { IApiClient } from "./IApiClient.js";
import { IRequestExecutor } from "./IRequestExecutor.js";
import { ApiRequest } from "./ApiRequest.js";
import { ApiResponse } from "./ApiResponse.js";
import { RequestInterceptorPipeline } from "./RequestInterceptorPipeline.js";
import { ResponseInterceptorPipeline } from "./ResponseInterceptorPipeline.js";
import { ApiErrorMapper } from "./ApiErrorMapper.js";

/**
 * RequestExecutor implementing IRequestExecutor, managing complete request filter pipelines.
 */
export class RequestExecutor implements IRequestExecutor {
  constructor(
    private readonly client: IApiClient,
    private readonly requestPipeline: RequestInterceptorPipeline,
    private readonly responsePipeline: ResponseInterceptorPipeline
  ) {}

  public async execute<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    try {
      const interceptedRequest = await this.requestPipeline.execute(request);
      const response = await this.client.execute<T>(interceptedRequest);
      const interceptedResponse = await this.responsePipeline.execute(response);

      if (interceptedResponse.status >= 400) {
        throw ApiErrorMapper.map(interceptedResponse);
      }

      return interceptedResponse;
    } catch (err: any) {
      if (err.name === "ApiException") {
        throw err;
      }
      throw ApiErrorMapper.mapTransportError(err, request);
    }
  }
}
