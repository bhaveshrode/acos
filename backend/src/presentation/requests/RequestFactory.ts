import { RequestBuilder } from "./RequestBuilder.js";
import { RequestBinder } from "./RequestBinder.js";
import { RequestNormalizer } from "./RequestNormalizer.js";
import { RequestMetadataBuilder } from "./RequestMetadataBuilder.js";
import { BodyExtractor } from "./BodyExtractor.js";
import { QueryExtractor } from "./QueryExtractor.js";
import { RouteParameterExtractor } from "./RouteParameterExtractor.js";
import { HeaderExtractor } from "./HeaderExtractor.js";

/**
 * RequestFactory constructing builders, normalizers, extractors, and parsers.
 */
export class RequestFactory {
  public static createBuilder(): RequestBuilder {
    return new RequestBuilder();
  }

  public static createBinder(): RequestBinder {
    return new RequestBinder();
  }

  public static createNormalizer(): RequestNormalizer {
    return new RequestNormalizer();
  }

  public static createMetadataBuilder(): RequestMetadataBuilder {
    return new RequestMetadataBuilder();
  }

  public static createBodyExtractor(): BodyExtractor {
    return new BodyExtractor();
  }

  public static createQueryExtractor(): QueryExtractor {
    return new QueryExtractor();
  }

  public static createRouteExtractor(): RouteParameterExtractor {
    return new RouteParameterExtractor();
  }

  public static createHeaderExtractor(): HeaderExtractor {
    return new HeaderExtractor();
  }
}
