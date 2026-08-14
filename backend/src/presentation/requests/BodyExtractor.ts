/**
 * BodyExtractor parsing JSON input bodies.
 */
export class BodyExtractor {
  public extract(request: any): any {
    return request.body || {};
  }
}
