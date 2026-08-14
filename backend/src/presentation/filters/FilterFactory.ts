import { FilterPipeline } from "./FilterPipeline.js";
import { FilterExecutor } from "./FilterExecutor.js";
import { AuthorizationFilter } from "./AuthorizationFilter.js";
import { ValidationFilter } from "./ValidationFilter.js";
import { ActionFilter } from "./ActionFilter.js";
import { ResultFilter } from "./ResultFilter.js";
import { ExceptionFilter } from "./ExceptionFilter.js";

/**
 * FilterFactory constructing executors, pipelines, and filters.
 */
export class FilterFactory {
  public static createPipeline(): FilterPipeline {
    return new FilterPipeline();
  }

  public static createExecutor(pipeline: FilterPipeline): FilterExecutor {
    return new FilterExecutor(pipeline);
  }

  public static createAuthorizationFilter(authorizer?: any): AuthorizationFilter {
    return new AuthorizationFilter(authorizer);
  }

  public static createValidationFilter(validator?: any): ValidationFilter {
    return new ValidationFilter(validator);
  }

  public static createActionFilter(): ActionFilter {
    return new ActionFilter();
  }

  public static createResultFilter(): ResultFilter {
    return new ResultFilter();
  }

  public static createExceptionFilter(): ExceptionFilter {
    return new ExceptionFilter();
  }
}
