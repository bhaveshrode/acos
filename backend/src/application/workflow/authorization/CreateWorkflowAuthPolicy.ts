import { IAuthPolicy } from "../../foundation/authorization/IAuthPolicy.js";
import { CreateWorkflowCommand } from "../commands/CreateWorkflowCommand.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";

/**
 * Authorization Policy checking that the user belongs to the target organization context.
 */
export class CreateWorkflowAuthPolicy implements IAuthPolicy<CreateWorkflowCommand> {
  public async isAuthorized(
    request: CreateWorkflowCommand,
    context: IExecutionContext
  ): Promise<boolean> {
    if (!context || !context.userId) return false;

    // Asserts user belongs to the command's target organizationId context
    return context.organizationId === request.dto.organizationId;
  }
}
