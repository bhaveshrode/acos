import { IFilter } from "./IFilter.js";
import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * ValidationFilter assessing incoming bodies payloads before execution.
 */
export class ValidationFilter implements IFilter {
  constructor(private readonly validator?: { validate(req: any): Promise<any> }) {}

  public async execute(context: FilterContext): Promise<FilterResult> {
    if (this.validator) {
      const errors = await this.validator.validate(context.request);
      if (errors) {
        return FilterResult.shortCircuit(400, { message: "Validation Filter Failure", errors });
      }
    } else {
      // Mock validation fallback
      if (context.request.body?.invalidField) {
        return FilterResult.shortCircuit(400, { message: "Validation Filter Failure" });
      }
    }
    return FilterResult.next();
  }
}
