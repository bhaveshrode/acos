import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Workflow Application components
import { CreateWorkflowCommand } from "../commands/CreateWorkflowCommand.js";
import { GetWorkflowByIdQuery } from "../queries/GetWorkflowByIdQuery.js";
import { CreateWorkflowCommandHandler } from "../handlers/CreateWorkflowCommandHandler.js";
import { GetWorkflowByIdQueryHandler } from "../handlers/GetWorkflowByIdQueryHandler.js";
import { CreateWorkflowCommandValidator } from "../validation/CreateWorkflowCommandValidator.js";
import { CreateWorkflowAuthPolicy } from "../authorization/CreateWorkflowAuthPolicy.js";
import { WorkflowMapper } from "../mapping/WorkflowMapper.js";
import { CreateWorkflowRequestDto } from "../dto/CreateWorkflowRequestDto.js";

// Domain Mock Repository
import { IWorkflowRepository } from "../../../business/workflow/repositories/IWorkflowRepository.js";
import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowId } from "../../../business/workflow/value-objects/WorkflowId.js";
import { WorkflowReference } from "../../../business/workflow/value-objects/WorkflowReference.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { AssignmentReference } from "../../../business/workflow/value-objects/AssignmentReference.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockWorkflowRepository implements IWorkflowRepository {
  private readonly items = new Map<string, Workflow>();

  public async findById(id: WorkflowId): Promise<Result<Workflow>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Workflow not found."));
    return Result.ok(item);
  }

  public async findByReference(
    orgId: OrganizationId,
    ref: WorkflowReference
  ): Promise<Result<Workflow>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.reference.equals(ref)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Workflow not found."));
  }

  public async findRunning(orgId: OrganizationId): Promise<Result<Workflow[]>> {
    const list = Array.from(this.items.values()).filter(
      (item) => item.organizationId.equals(orgId) && item.status === "RUNNING"
    );
    return Result.ok(list);
  }

  public async findByAssignee(
    orgId: OrganizationId,
    assignee: AssignmentReference
  ): Promise<Result<Workflow[]>> {
    const list = Array.from(this.items.values()).filter((item) => {
      if (!item.organizationId.equals(orgId)) return false;
      return item.tasks.some((t) => t.assignee && t.assignee.equals(assignee));
    });
    return Result.ok(list);
  }

  public async save(workflow: Workflow): Promise<Result<void>> {
    this.items.set(workflow.id.value, workflow);
    return Result.ok();
  }

  public async delete(id: WorkflowId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Workflow Module Application Layer Tests (Task 23.8)", () => {
  const repository = new MockWorkflowRepository();
  const mapper = new WorkflowMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";

  const validDto: CreateWorkflowRequestDto = {
    organizationId: orgId1,
    reference: "WRK-2027-000001",
    name: "Invoice obligation approval",
    priority: "HIGH",
    deadline: new Date(Date.now() + 15 * 86400 * 1000).toISOString(),
    tasks: [
      {
        title: "Review invoice line items details",
        assignee: "approval-mgr",
        dueDate: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
        required: true
      }
    ]
  };

  const validContext: IExecutionContext = {
    userId: "user-123",
    organizationId: orgId1,
    correlationId: "corr-id",
    timestamp: new Date()
  };

  const invalidContext: IExecutionContext = {
    userId: "user-456",
    organizationId: orgId2,
    correlationId: "corr-id-2",
    timestamp: new Date()
  };

  const getPipelineMediator = (contextObj: IExecutionContext) => {
    const mediator = new Mediator();

    const valBehavior = new ValidationBehavior<any, any>();
    valBehavior.registerValidator(CreateWorkflowCommand, new CreateWorkflowCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => contextObj);
    authBehavior.registerPolicy(CreateWorkflowCommand, new CreateWorkflowAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(
      CreateWorkflowCommand,
      new CreateWorkflowCommandHandler(repository, mapper)
    );
    mediator.registerHandler(
      GetWorkflowByIdQuery,
      new GetWorkflowByIdQueryHandler(repository, mapper)
    );

    return mediator;
  };

  it("should successfully record workflow in draft status with tasks", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new CreateWorkflowCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.reference).toBe("WRK-2027-000001");
    expect(result.value!.name).toBe("Invoice obligation approval");
    expect(result.value!.status).toBe("DRAFT");
    expect(result.value!.tasks).toHaveLength(1);
    expect(result.value!.tasks[0].title).toBe("Review invoice line items details");
    expect(result.value!.tasks[0].assignee).toBe("approval-mgr");
    expect(result.value!.tasks[0].status).toBe("ASSIGNED");
    expect(result.value!.tasks[0].required).toBe(true);
  });

  it("should throw ValidationException when reference does not start with WRK-", async () => {
    const mediator = getPipelineMediator(validContext);

    const badDto = {
      ...validDto,
      reference: "123-REF"
    };

    await expect(mediator.send(new CreateWorkflowCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext);
    const command = new CreateWorkflowCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should fail when creating a duplicate workflow reference number", async () => {
    const mediator = getPipelineMediator(validContext);

    const dupDto = {
      ...validDto,
      reference: "WRK-UNIQUE-DUP"
    };

    // First works
    const result1 = await mediator.send(new CreateWorkflowCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new CreateWorkflowCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load recorded workflow details by ID via GetWorkflowByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const dto = {
      ...validDto,
      reference: "WRK-2027-000009"
    };
    const registerRes = await mediator.send(new CreateWorkflowCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetWorkflowByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.reference).toBe("WRK-2027-000009");
  });
});
