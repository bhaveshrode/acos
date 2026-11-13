import { ApiRequest } from "./ApiRequest.js";

/**
 * RequestBuilder supplying a fluent builder API for assembling HTTP ApiRequests.
 */
export class RequestBuilder {
  private method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET";
  private url: string = "";
  private readonly headers: Record<string, string> = {};
  private readonly query: Record<string, string> = {};
  private body?: any;
  private timeoutMs?: number;

  public setMethod(method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"): this {
    this.method = method;
    return this;
  }

  public setUrl(url: string): this {
    this.url = url;
    return this;
  }

  public addHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  public addQuery(name: string, value: string): this {
    this.query[name] = value;
    return this;
  }

  public setBody(body: any): this {
    this.body = body;
    return this;
  }

  public setTimeout(timeoutMs: number): this {
    this.timeoutMs = timeoutMs;
    return this;
  }

  public build(): ApiRequest {
    return new ApiRequest(
      this.method,
      this.url,
      { ...this.headers },
      { ...this.query },
      this.body,
      this.timeoutMs
    );
  }
}
