import { RequestMetadata } from "./RequestMetadata.js";
import { CorrelationResolver } from "./CorrelationResolver.js";
import { RequestHeadersParser } from "./RequestHeadersParser.js";

/**
 * RequestMetadataBuilder compiling tracing context and start timestamps.
 */
export class RequestMetadataBuilder {
  private correlationResolver = new CorrelationResolver();
  private headersParser = new RequestHeadersParser();

  public build(request: any): RequestMetadata {
    const headers = request.headers || {};
    const correlationId = this.correlationResolver.resolve(headers);
    const parsedHeaders = this.headersParser.parse(headers);
    return new RequestMetadata({
      correlationId,
      requestId: headers["x-request-id"] || `req-${Math.random().toString(36).substring(2, 11)}`,
      clientIp: parsedHeaders.clientIp || request.ip,
      userAgent: parsedHeaders.userAgent,
      timestamp: new Date(),
      executionStartTimeMs: Date.now()
    });
  }
}
