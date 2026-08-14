import { IFilter } from "./IFilter.js";
import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * ResultFilter decorating response payloads.
 */
export class ResultFilter implements IFilter {
  public async execute(context: FilterContext): Promise<FilterResult> {
    context.metadata.resultProcessed = true;
    return FilterResult.next();
  }
}
