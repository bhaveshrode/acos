import { FilterPipeline } from "./FilterPipeline.js";
import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * FilterExecutor running sequential filter executions.
 */
export class FilterExecutor {
  constructor(private readonly pipeline: FilterPipeline) {}

  public async execute(context: FilterContext): Promise<FilterResult> {
    for (const filter of this.pipeline.getFilters()) {
      const result = await filter.execute(context);
      if (result.shortCircuit) {
        return result;
      }
    }
    return FilterResult.next();
  }
}
