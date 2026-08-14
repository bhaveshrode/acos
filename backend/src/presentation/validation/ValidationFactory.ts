import { RequestValidator } from "./RequestValidator.js";
import { BodyValidator } from "./BodyValidator.js";
import { QueryValidator } from "./QueryValidator.js";
import { RouteParameterValidator } from "./RouteParameterValidator.js";
import { HeaderValidator } from "./HeaderValidator.js";
import { RequestBinder } from "./RequestBinder.js";

/**
 * ValidationFactory building validator engines and request parameter binders.
 */
export class ValidationFactory {
  public static createRequestValidator(): RequestValidator {
    return new RequestValidator();
  }

  public static createBodyValidator(validator: RequestValidator): BodyValidator {
    return new BodyValidator(validator);
  }

  public static createQueryValidator(validator: RequestValidator): QueryValidator {
    return new QueryValidator(validator);
  }

  public static createRouteValidator(validator: RequestValidator): RouteParameterValidator {
    return new RouteParameterValidator(validator);
  }

  public static createHeaderValidator(validator: RequestValidator): HeaderValidator {
    return new HeaderValidator(validator);
  }

  public static createRequestBinder(): RequestBinder {
    return new RequestBinder();
  }
}
