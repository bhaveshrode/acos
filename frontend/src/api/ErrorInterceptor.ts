import { IApiInterceptor } from "./IApiInterceptor.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * ErrorInterceptor filtering responses.
 */
export class ErrorInterceptor implements IApiInterceptor {
  public async interceptResponse(response: ApiResponse<any>): Promise<ApiResponse<any>> {
    return response;
  }
}
