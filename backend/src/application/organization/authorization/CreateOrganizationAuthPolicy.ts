import { IAuthPolicy } from "../../foundation/authorization/IAuthPolicy.js";
import { CreateOrganizationCommand } from "../commands/CreateOrganizationCommand.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";

/**
 * Authorization Policy checking that the acting user context is authenticated.
 */
export class CreateOrganizationAuthPolicy implements IAuthPolicy<CreateOrganizationCommand> {
  public async isAuthorized(
    request: CreateOrganizationCommand,
    context: IExecutionContext
  ): Promise<boolean> {
    // Only registered/authenticated users can create organizations
    return context !== null && context.userId !== null;
  }
}
