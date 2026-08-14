import { describe, it, expect, vi } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";

// Identity Application components
import { RegisterUserCommand } from "../commands/RegisterUserCommand.js";
import { GetUserByIdQuery } from "../queries/GetUserByIdQuery.js";
import { RegisterUserCommandHandler } from "../handlers/RegisterUserCommandHandler.js";
import { GetUserByIdQueryHandler } from "../handlers/GetUserByIdQueryHandler.js";
import { RegisterUserCommandValidator } from "../validation/RegisterUserCommandValidator.js";
import { RegisterUserAuthPolicy } from "../authorization/RegisterUserAuthPolicy.js";
import { UserMapper } from "../mapping/UserMapper.js";
import { RegisterUserRequestDto } from "../dto/RegisterUserRequestDto.js";

// Domain Mock Repository & Hasher
import { IUserRepository } from "../../../business/identity/repositories/IUserRepository.js";
import { User } from "../../../business/identity/aggregates/User.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { IPasswordHasher } from "../../../foundation/contracts/security/IPasswordHasher.js";

// Mock In-Memory Repository
class MockUserRepository implements IUserRepository {
  private readonly items = new Map<string, User>();

  public async findById(id: UserId): Promise<Result<User>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("User not found."));
    return Result.ok(item);
  }

  public async findByEmail(email: Email): Promise<Result<User>> {
    for (const item of this.items.values()) {
      if (item.email.equals(email)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("User not found."));
  }

  public async exists(email: Email): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.email.equals(email)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(user: User): Promise<Result<void>> {
    this.items.set(user.id.value, user);
    return Result.ok();
  }

  public async delete(id: UserId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

// Mock Password Hasher
class MockPasswordHasher implements IPasswordHasher {
  public async hash(password: string): Promise<Result<string>> {
    return Result.ok(`hashed-${password}`);
  }

  public async compare(password: string, hash: string): Promise<Result<boolean>> {
    return Result.ok(hash === `hashed-${password}`);
  }
}

describe("Identity Module Application Layer Tests (Task 23.1)", () => {
  const repository = new MockUserRepository();
  const mapper = new UserMapper();
  const hasher = new MockPasswordHasher();

  const validDto: RegisterUserRequestDto = {
    email: "user@example.com",
    passwordPlaintext: "SuperSecurePass123!",
    name: "John Doe"
  };

  const context: IExecutionContext = {
    userId: null,
    organizationId: null,
    correlationId: "corr-id",
    timestamp: new Date()
  };

  const getPipelineMediator = () => {
    const mediator = new Mediator();

    const valBehavior = new ValidationBehavior<any, any>();
    valBehavior.registerValidator(RegisterUserCommand, new RegisterUserCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => context);
    authBehavior.registerPolicy(RegisterUserCommand, new RegisterUserAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(
      RegisterUserCommand,
      new RegisterUserCommandHandler(repository, mapper, hasher)
    );
    mediator.registerHandler(GetUserByIdQuery, new GetUserByIdQueryHandler(repository, mapper));

    return mediator;
  };

  it("should successfully register user in PENDING_VERIFICATION state", async () => {
    const mediator = getPipelineMediator();
    const command = new RegisterUserCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.email).toBe("user@example.com");
    expect(result.value!.status).toBe("PENDING_VERIFICATION");
    expect(result.value!.name).toBe("John Doe");
  });

  it("should throw ValidationException for invalid inputs", async () => {
    const mediator = getPipelineMediator();

    const badDto = {
      ...validDto,
      email: "bad-email",
      passwordPlaintext: "short"
    };

    await expect(mediator.send(new RegisterUserCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should fail when registering a duplicate email address", async () => {
    const mediator = getPipelineMediator();

    const dupDto = {
      ...validDto,
      email: "dup@example.com"
    };

    // First works
    const result1 = await mediator.send(new RegisterUserCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new RegisterUserCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already registered");
  });

  it("should load user profile details by ID via GetUserByIdQuery", async () => {
    const mediator = getPipelineMediator();

    const dto = {
      ...validDto,
      email: "query@example.com"
    };
    const registerRes = await mediator.send(new RegisterUserCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetUserByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.email).toBe("query@example.com");
  });
});
