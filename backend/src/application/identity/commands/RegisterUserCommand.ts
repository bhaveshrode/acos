import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { RegisterUserRequestDto } from "../dto/RegisterUserRequestDto.js";
import { UserResponseDto } from "../dto/UserResponseDto.js";

/**
 * Command to request registration of a new user.
 */
export class RegisterUserCommand implements ICommand<ApplicationResult<UserResponseDto>> {
  readonly requestType?: ApplicationResult<UserResponseDto>;
  constructor(public readonly dto: RegisterUserRequestDto) {}
}
