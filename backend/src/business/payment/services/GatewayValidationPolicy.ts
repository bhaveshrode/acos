import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

/**
 * Domain Service enforcing structure and code validation on gateway provider responses.
 */
export class GatewayValidationPolicy {
  /**
   * Asserts if the gateway response HTTP status indicates success.
   */
  public validateGatewayResponse(
    status: number,
    responseBody: string
  ): Result<void> {
    if (status !== 200 && status !== 201) {
      return Result.fail(
        ResultError.validation(
          `Gateway request failed with code ${status}. Details: ${responseBody}`
        )
      );
    }
    return Result.ok();
  }
}
