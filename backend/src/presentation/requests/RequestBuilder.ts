import { ApiRequest } from "./ApiRequest.js";
import { BodyExtractor } from "./BodyExtractor.js";
import { QueryExtractor } from "./QueryExtractor.js";
import { RouteParameterExtractor } from "./RouteParameterExtractor.js";
import { HeaderExtractor } from "./HeaderExtractor.js";

/**
 * RequestBuilder assembling unified ApiRequest wrappers.
 */
export class RequestBuilder {
  private bodyExtractor = new BodyExtractor();
  private queryExtractor = new QueryExtractor();
  private routeExtractor = new RouteParameterExtractor();
  private headerExtractor = new HeaderExtractor();

  public build(request: any): ApiRequest {
    return new ApiRequest(
      this.bodyExtractor.extract(request),
      this.queryExtractor.extract(request),
      this.routeExtractor.extract(request),
      this.headerExtractor.extract(request)
    );
  }
}
