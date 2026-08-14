import { ApiResponse } from "./ApiResponse.js";
import { ApiRequest } from "./ApiRequest.js";
import { ApiException } from "./ApiException.js";

/**
 * ApiErrorMapper mapping HTTP codes and transport failures into custom exceptions.
 */
export class ApiErrorMapper {
  public static map(response: ApiResponse<any>): ApiException {
    const data = response.data;
    const message =
      (data && (data.message || data.error)) ||
      `API request failed with status: ${response.status}`;
    return new ApiException(message, response.status, data);
  }

  public static mapTransportError(error: Error, request: ApiRequest): ApiException {
    return new ApiException(`Network connection failure for request: ${request.url} - ${error.message}`);
  }
}
