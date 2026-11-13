/**
 * ApiRequest encapsulating method, URL paths, headers, query parameters, payloads, and timeout settings.
 */
export class ApiRequest {
  constructor(
    public readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    public readonly url: string,
    public readonly headers: Readonly<Record<string, string>> = {},
    public readonly query: Readonly<Record<string, string>> = {},
    public readonly body?: any,
    public readonly timeoutMs?: number
  ) {
    Object.freeze(this.headers);
    Object.freeze(this.query);
    Object.freeze(this);
  }
}
