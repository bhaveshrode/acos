import { IFilter } from "./IFilter.js";
import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * ActionFilter intercepting controller executions.
 */
export class ActionFilter implements IFilter {
  public async execute(context: FilterContext): Promise<FilterResult> {
    context.metadata.actionStarted = true;
    return FilterResult.next();
  }
}
