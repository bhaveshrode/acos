import { IFilter } from "./IFilter.js";
import { FilterContext } from "./FilterContext.js";
import { FilterResult } from "./FilterResult.js";

/**
 * AuthorizationFilter enforcing security rules before actions.
 */
export class AuthorizationFilter implements IFilter {
  constructor(private readonly authorizer?: { authorize(req: any): Promise<boolean> }) {}

  public async execute(context: FilterContext): Promise<FilterResult> {
    if (this.authorizer) {
      const authorized = await this.authorizer.authorize(context.request);
      if (!authorized) {
        return FilterResult.shortCircuit(401, { message: "Unauthorized Filter Denial" });
      }
    } else {
      // Mock validation fallback
      if (context.request.headers?.authorization === "deny") {
        return FilterResult.shortCircuit(401, { message: "Unauthorized Filter Denial" });
      }
    }
    return FilterResult.next();
  }
}
