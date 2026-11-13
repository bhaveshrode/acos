import { IApiInterceptor } from "./IApiInterceptor.js";
import { ApiRequest } from "./ApiRequest.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * LoggingInterceptor tracking request metrics.
 */
export class LoggingInterceptor implements IApiInterceptor {
  private readonly logs: string[] = [];

  public async interceptRequest(request: ApiRequest): Promise<ApiRequest> {
    this.logs.push(`[API REQUEST] ${request.method} -> ${request.url}`);
    return request;
  }

  public async interceptResponse(response: ApiResponse<any>): Promise<ApiResponse<any>> {
    this.logs.push(`[API RESPONSE] Status: ${response.status} (${response.durationMs}ms)`);
    return response;
  }

  public getLogs(): string[] {
    return [...this.logs];
  }
}
