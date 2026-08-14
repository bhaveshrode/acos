import { IAuthPolicy } from "../../foundation/authorization/IAuthPolicy.js";
import { ProcessSettlementCommand } from "../commands/ProcessSettlementCommand.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";

/**
 * Authorization Policy checking that the user belongs to the target organization context.
 */
export class ProcessSettlementAuthPolicy implements IAuthPolicy<ProcessSettlementCommand> {
  public async isAuthorized(
    request: ProcessSettlementCommand,
    context: IExecutionContext
  ): Promise<boolean> {
    if (!context || !context.userId) return false;

    // Asserts user belongs to the command's target organizationId context
    return context.organizationId === request.dto.organizationId;
  }
}
