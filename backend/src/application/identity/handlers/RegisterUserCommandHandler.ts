import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { RegisterUserCommand } from "../commands/RegisterUserCommand.js";
import { UserResponseDto } from "../dto/UserResponseDto.js";
import { IUserRepository } from "../../../business/identity/repositories/IUserRepository.js";
import { UserMapper } from "../mapping/UserMapper.js";
import { IPasswordHasher } from "../../../foundation/contracts/security/IPasswordHasher.js";

// Domain imports
import { User } from "../../../business/identity/aggregates/User.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { PasswordHash } from "../../../business/identity/value-objects/PasswordHash.js";
import { VerificationToken } from "../../../business/identity/value-objects/VerificationToken.js";

/**
 * Use case handler registering a User account.
 */
export class RegisterUserCommandHandler
  implements IRequestHandler<RegisterUserCommand, ApplicationResult<UserResponseDto>>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly mapper: UserMapper,
    private readonly hasher: IPasswordHasher
  ) {}

  public async handle(request: RegisterUserCommand): Promise<ApplicationResult<UserResponseDto>> {
    const { dto } = request;

    // Validate email object creation
    const emailRes = Email.create(dto.email);
    if (emailRes.isFailure) return ApplicationResult.failure(emailRes.error.message);

    // Verify uniqueness of email address
    const existsRes = await this.repository.exists(emailRes.value);
    if (existsRes.isFailure) return ApplicationResult.failure(existsRes.error.message);
    if (existsRes.value) {
      return ApplicationResult.failure(`Email '${dto.email}' is already registered.`);
    }

    // Cryptographically hash password plaintext
    const hashRes = await this.hasher.hash(dto.passwordPlaintext);
    if (hashRes.isFailure) return ApplicationResult.failure(hashRes.error.message);

    const passHashRes = PasswordHash.create(hashRes.value);
    if (passHashRes.isFailure) return ApplicationResult.failure(passHashRes.error.message);

    // Instantiate email verification token (expires in 24 hours)
    const tokenVal = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
    const tokenRes = VerificationToken.create(tokenVal, expiresAt);
    if (tokenRes.isFailure) return ApplicationResult.failure(tokenRes.error.message);

    // Register User
    const userRes = User.register(
      UserId.generate(),
      emailRes.value,
      passHashRes.value,
      dto.name,
      tokenRes.value
    );

    if (userRes.isFailure) return ApplicationResult.failure(userRes.error.message);

    // Persist User record
    const saveRes = await this.repository.save(userRes.value);
    if (saveRes.isFailure) return ApplicationResult.failure(saveRes.error.message);

    return ApplicationResult.success(this.mapper.map(userRes.value));
  }
}
