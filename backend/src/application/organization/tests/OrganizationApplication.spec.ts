import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Organization Application components
import { CreateOrganizationCommand } from "../commands/CreateOrganizationCommand.js";
import { GetOrganizationByIdQuery } from "../queries/GetOrganizationByIdQuery.js";
import { CreateOrganizationCommandHandler } from "../handlers/CreateOrganizationCommandHandler.js";
import { GetOrganizationByIdQueryHandler } from "../handlers/GetOrganizationByIdQueryHandler.js";
import { CreateOrganizationCommandValidator } from "../validation/CreateOrganizationCommandValidator.js";
import { CreateOrganizationAuthPolicy } from "../authorization/CreateOrganizationAuthPolicy.js";
import { OrganizationMapper } from "../mapping/OrganizationMapper.js";
import { CreateOrganizationRequestDto } from "../dto/CreateOrganizationRequestDto.js";

// Domain Mock Repository
import { IOrganizationRepository } from "../../../business/organization/repositories/IOrganizationRepository.js";
import { Organization } from "../../../business/organization/aggregates/Organization.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { OrganizationSlug } from "../../../business/organization/value-objects/OrganizationSlug.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockOrganizationRepository implements IOrganizationRepository {
  private readonly items = new Map<string, Organization>();

  public async findById(id: OrganizationId): Promise<Result<Organization>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Organization not found."));
    return Result.ok(item);
  }

  public async findBySlug(slug: OrganizationSlug): Promise<Result<Organization>> {
    for (const item of this.items.values()) {
      if (item.slug.equals(slug)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Organization not found."));
  }

  public async exists(slug: OrganizationSlug): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.slug.equals(slug)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(org: Organization): Promise<Result<void>> {
    this.items.set(org.id.value, org);
    return Result.ok();
  }

  public async delete(id: OrganizationId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Organization Module Application Layer Tests (Task 23.2)", () => {
  const repository = new MockOrganizationRepository();
  const mapper = new OrganizationMapper();

  const ownerUserId = "30eac582-b75c-4540-8b1d-95de2acfc789";

  const validDto: CreateOrganizationRequestDto = {
    name: "Acos Labs",
    slug: "acos-labs",
    ownerId: ownerUserId,
    currency: "USD"
  };

  const context: IExecutionContext = {
    userId: ownerUserId,
    organizationId: null,
    correlationId: "corr-id",
    timestamp: new Date()
  };

  const getPipelineMediator = (execContext: IExecutionContext | null) => {
    const mediator = new Mediator();

    const valBehavior = new ValidationBehavior<any, any>();
    valBehavior.registerValidator(CreateOrganizationCommand, new CreateOrganizationCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => execContext!);
    authBehavior.registerPolicy(CreateOrganizationCommand, new CreateOrganizationAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(
      CreateOrganizationCommand,
      new CreateOrganizationCommandHandler(repository, mapper)
    );
    mediator.registerHandler(
      GetOrganizationByIdQuery,
      new GetOrganizationByIdQueryHandler(repository, mapper)
    );

    return mediator;
  };

  it("should successfully create organization and auto-join owner as active member", async () => {
    const mediator = getPipelineMediator(context);
    const command = new CreateOrganizationCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.name).toBe("Acos Labs");
    expect(result.value!.slug).toBe("acos-labs");
    expect(result.value!.members).toHaveLength(1);
    expect(result.value!.members[0].userId).toBe(ownerUserId);
    expect(result.value!.members[0].role).toBe("OWNER");
    expect(result.value!.members[0].status).toBe("ACTIVE");
  });

  it("should throw ValidationException on malformed slug names", async () => {
    const mediator = getPipelineMediator(context);

    const badDto = {
      ...validDto,
      slug: "Acos Labs! (Invalid)"
    };

    await expect(mediator.send(new CreateOrganizationCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user is not authenticated", async () => {
    const mediator = getPipelineMediator({
      userId: null,
      organizationId: null,
      correlationId: "corr",
      timestamp: new Date()
    });

    await expect(mediator.send(new CreateOrganizationCommand(validDto))).rejects.toThrow(
      AuthorizationException
    );
  });

  it("should return a failure result when slug already exists", async () => {
    const mediator = getPipelineMediator(context);

    const dupDto = {
      ...validDto,
      slug: "duplicate-slug"
    };

    // First works
    const result1 = await mediator.send(new CreateOrganizationCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new CreateOrganizationCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load organization details by ID via GetOrganizationByIdQuery", async () => {
    const mediator = getPipelineMediator(context);

    const dto = {
      ...validDto,
      slug: "query-org"
    };
    const registerRes = await mediator.send(new CreateOrganizationCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetOrganizationByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.slug).toBe("query-org");
  });
});
