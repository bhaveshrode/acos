import { ITokenProvider } from "./TokenProvider.js";
import { ApiRequest } from "./ApiRequest.js";

/**
 * AuthenticationHandler attaching tokens to outgoing requests.
 */
export class AuthenticationHandler {
  constructor(
    private readonly tokenProvider: ITokenProvider,
    private readonly headerScheme: string = "Bearer"
  ) {}

  public attachToken(request: ApiRequest): ApiRequest {
    const token = this.tokenProvider.getToken();
    if (!token) return request;

    const headers = {
      ...request.headers,
      Authorization: `${this.headerScheme} ${token}`
    };

    return new ApiRequest(
      request.method,
      request.url,
      headers,
      request.query,
      request.body,
      request.timeoutMs
    );
  }
}
