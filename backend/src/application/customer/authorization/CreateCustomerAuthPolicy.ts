import { IAuthPolicy } from "../../foundation/authorization/IAuthPolicy.js";
import { CreateCustomerCommand } from "../commands/CreateCustomerCommand.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";

/**
 * Authorization Policy checking that the acting user context matches the target organization context.
 */
export class CreateCustomerAuthPolicy implements IAuthPolicy<CreateCustomerCommand> {
  public async isAuthorized(
    request: CreateCustomerCommand,
    context: IExecutionContext
  ): Promise<boolean> {
    if (!context || !context.userId) return false;

    // Asserts user belongs to the command's target organizationId context
    return context.organizationId === request.dto.organizationId;
  }
}
