/**
 * ContentTypeResolver resolving request and response media types from headers.
 */
export class ContentTypeResolver {
  /**
   * Evaluates Accept headers.
   */
  public resolveResponseContentType(acceptHeader?: string): string {
    if (!acceptHeader) return "application/json";
    if (acceptHeader.includes("application/xml")) return "application/xml";
    return "application/json";
  }

  /**
   * Evaluates Content-Type headers.
   */
  public resolveRequestContentType(contentTypeHeader?: string): string {
    if (!contentTypeHeader) return "application/json";
    return contentTypeHeader.split(";")[0].trim();
  }
}
