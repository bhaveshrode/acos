import { ApiRequest } from "./ApiRequest.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * IApiClient interface contract representing transport-agnostic communication requests execution.
 */
export interface IApiClient {
  execute<T = any>(request: ApiRequest): Promise<ApiResponse<T>>;
}
