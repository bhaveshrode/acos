import { SuccessResponseBuilder } from "./SuccessResponseBuilder.js";
import { ErrorResponseBuilder } from "./ErrorResponseBuilder.js";
import { PagedResponseBuilder } from "./PagedResponseBuilder.js";

/**
 * ResponseFactory constructing builders configurations.
 */
export class ResponseFactory {
  public static createSuccessBuilder(): SuccessResponseBuilder {
    return new SuccessResponseBuilder();
  }

  public static createErrorBuilder(): ErrorResponseBuilder {
    return new ErrorResponseBuilder();
  }

  public static createPagedBuilder(): PagedResponseBuilder {
    return new PagedResponseBuilder();
  }
}
