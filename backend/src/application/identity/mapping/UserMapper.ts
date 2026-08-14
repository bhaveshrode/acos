import { IMapper } from "../../foundation/mapping/IMapper.js";
import { User } from "../../../business/identity/aggregates/User.js";
import { UserResponseDto } from "../dto/UserResponseDto.js";

/**
 * Mapper helper converting User entities into presentation UserResponseDto models.
 */
export class UserMapper implements IMapper<User, UserResponseDto> {
  public map(source: User): UserResponseDto {
    return {
      id: source.id.value,
      email: source.email.value,
      name: source.name,
      status: source.status,
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString()
    };
  }
}
