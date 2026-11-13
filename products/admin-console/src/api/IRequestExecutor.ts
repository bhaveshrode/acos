import { ApiRequest } from "./ApiRequest.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * IRequestExecutor contract interface defining API execution pipelines.
 */
export interface IRequestExecutor {
  execute<T = any>(request: ApiRequest): Promise<ApiResponse<T>>;
}
