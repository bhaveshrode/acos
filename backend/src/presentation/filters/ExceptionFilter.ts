import { IFilter } from "./IFilter.js";
import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * ExceptionFilter transforming exceptions into standardized envelopes.
 */
export class ExceptionFilter implements IFilter {
  public async execute(context: FilterContext): Promise<FilterResult> {
    if (context.metadata.exception) {
      return FilterResult.shortCircuit(500, {
        message: "Internal Server Exception Filter Error",
        error: context.metadata.exception.message
      });
    }
    return FilterResult.next();
  }
}
