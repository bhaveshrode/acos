import { ApiResponse } from "./ApiResponse.js";

/**
 * SuccessResponseBuilder creating standard success payloads.
 */
export class SuccessResponseBuilder {
  public build<T>(data: T, metadata?: Record<string, any>): ApiResponse<T> {
    return new ApiResponse<T>(true, data, undefined, metadata);
  }
}
