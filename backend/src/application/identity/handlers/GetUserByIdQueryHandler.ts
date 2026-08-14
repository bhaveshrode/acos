import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetUserByIdQuery } from "../queries/GetUserByIdQuery.js";
import { UserResponseDto } from "../dto/UserResponseDto.js";
import { IUserRepository } from "../../../business/identity/repositories/IUserRepository.js";
import { UserMapper } from "../mapping/UserMapper.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";

/**
 * Use case handler reading a User profile by ID.
 */
export class GetUserByIdQueryHandler
  implements IRequestHandler<GetUserByIdQuery, ApplicationResult<UserResponseDto>>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly mapper: UserMapper
  ) {}

  public async handle(request: GetUserByIdQuery): Promise<ApplicationResult<UserResponseDto>> {
    const userId = UserId.from(request.id);
    const loadRes = await this.repository.findById(userId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
