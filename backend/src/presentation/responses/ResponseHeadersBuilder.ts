/**
 * ResponseHeadersBuilder helper configuring HTTP headers.
 */
export class ResponseHeadersBuilder {
  private headers: Record<string, string> = {};

  public withCorrelationId(correlationId: string): this {
    this.headers["Correlation-Id"] = correlationId;
    return this;
  }

  public withCacheControl(cacheControl: string): this {
    this.headers["Cache-Control"] = cacheControl;
    return this;
  }

  public withETag(etag: string): this {
    this.headers["ETag"] = etag;
    return this;
  }

  public build(): Record<string, string> {
    return this.headers;
  }
}
