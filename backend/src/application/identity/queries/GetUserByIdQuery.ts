import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { UserResponseDto } from "../dto/UserResponseDto.js";

/**
 * Query to request loading a User profile by ID.
 */
export class GetUserByIdQuery implements IQuery<ApplicationResult<UserResponseDto>> {
  constructor(public readonly id: string) {}
}
