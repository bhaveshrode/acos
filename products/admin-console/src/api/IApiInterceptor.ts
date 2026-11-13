import { ApiRequest } from "./ApiRequest.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * IApiInterceptor defining hooks to process outgoing requests and incoming responses.
 */
export interface IApiInterceptor {
  interceptRequest?(request: ApiRequest): Promise<ApiRequest>;
  interceptResponse?(response: ApiResponse<any>): Promise<ApiResponse<any>>;
}
