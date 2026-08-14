/**
 * HeaderExtractor parsing request headers.
 */
export class HeaderExtractor {
  public extract(request: any): Record<string, any> {
    return request.headers || {};
  }
}
