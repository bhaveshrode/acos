import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * IFilter defining the standard request interceptor execution contract.
 */
export interface IFilter {
  execute(context: FilterContext): Promise<FilterResult>;
}
