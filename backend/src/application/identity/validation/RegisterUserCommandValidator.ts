import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { RegisterUserCommand } from "../commands/RegisterUserCommand.js";

/**
 * Request validator checking fields structures and formats for registering a User.
 */
export class RegisterUserCommandValidator implements IRequestValidator<RegisterUserCommand> {
  public validate(request: RegisterUserCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.email || dto.email.trim() === "") {
      errors.push("Email is required.");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        errors.push(`Invalid email format: '${dto.email}'.`);
      }
    }

    if (!dto.passwordPlaintext || dto.passwordPlaintext.length < 8) {
      errors.push("Password must be at least 8 characters.");
    }

    if (!dto.name || dto.name.trim() === "") {
      errors.push("Name is required.");
    }

    return errors;
  }
}
