import { IAuthPolicy } from "../../foundation/authorization/IAuthPolicy.js";
import { RegisterUserCommand } from "../commands/RegisterUserCommand.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";

/**
 * Authorization Policy allowing public/anonymous registrations of User profiles.
 */
export class RegisterUserAuthPolicy implements IAuthPolicy<RegisterUserCommand> {
  public async isAuthorized(
    request: RegisterUserCommand,
    context: IExecutionContext
  ): Promise<boolean> {
    // Registrations are public/anonymous
    return true;
  }
}
