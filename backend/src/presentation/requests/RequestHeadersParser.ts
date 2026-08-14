/**
 * RequestHeadersParser processing standard request header strings.
 */
export class RequestHeadersParser {
  public parse(headers: Record<string, any>): Record<string, any> {
    return {
      userAgent: headers["user-agent"],
      clientIp: headers["x-forwarded-for"] || headers["x-real-ip"]
    };
  }
}
