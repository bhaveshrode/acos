/**
 * QueryExtractor parsing URL queries.
 */
export class QueryExtractor {
  public extract(request: any): Record<string, any> {
    return request.query || {};
  }
}
