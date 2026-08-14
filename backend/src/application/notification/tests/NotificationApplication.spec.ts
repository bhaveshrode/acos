import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Notification Application components
import { SendNotificationCommand } from "../commands/SendNotificationCommand.js";
import { GetNotificationByIdQuery } from "../queries/GetNotificationByIdQuery.js";
import { SendNotificationCommandHandler } from "../handlers/SendNotificationCommandHandler.js";
import { GetNotificationByIdQueryHandler } from "../handlers/GetNotificationByIdQueryHandler.js";
import { SendNotificationCommandValidator } from "../validation/SendNotificationCommandValidator.js";
import { SendNotificationAuthPolicy } from "../authorization/SendNotificationAuthPolicy.js";
import { NotificationMapper } from "../mapping/NotificationMapper.js";
import { SendNotificationRequestDto } from "../dto/SendNotificationRequestDto.js";

// Domain Mock Repository
import { INotificationRepository } from "../../../business/notification/repositories/INotificationRepository.js";
import { Notification } from "../../../business/notification/aggregates/Notification.js";
import { NotificationId } from "../../../business/notification/value-objects/NotificationId.js";
import { NotificationReference } from "../../../business/notification/value-objects/NotificationReference.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockNotificationRepository implements INotificationRepository {
  private readonly items = new Map<string, Notification>();

  public async findById(id: NotificationId): Promise<Result<Notification>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Notification not found."));
    return Result.ok(item);
  }

  public async findByReference(
    orgId: OrganizationId,
    ref: NotificationReference
  ): Promise<Result<Notification>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.reference.equals(ref)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Notification not found."));
  }

  public async findByRecipient(orgId: OrganizationId, userId: UserId): Promise<Result<Notification[]>> {
    const list = Array.from(this.items.values()).filter((item) => {
      if (!item.organizationId.equals(orgId)) return false;
      return item.recipients.some((r) => r.userId && r.userId.equals(userId));
    });
    return Result.ok(list);
  }

  public async findPending(orgId: OrganizationId): Promise<Result<Notification[]>> {
    const list = Array.from(this.items.values()).filter(
      (item) => item.organizationId.equals(orgId) && item.status === "PENDING"
    );
    return Result.ok(list);
  }

  public async save(notification: Notification): Promise<Result<void>> {
    this.items.set(notification.id.value, notification);
    return Result.ok();
  }

  public async delete(id: NotificationId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Notification Module Application Layer Tests (Task 23.7)", () => {
  const repository = new MockNotificationRepository();
  const mapper = new NotificationMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";

  const validDto: SendNotificationRequestDto = {
    organizationId: orgId1,
    reference: "NTF-2027-000001",
    subject: "Invoice obligation reminder",
    body: "Please settle outstanding balance of invoice obligations.",
    priority: "HIGH",
    recipients: [
      {
        userId: "30eac582-b75c-4540-8b1d-95de2acfc792",
        email: "customer@example.com",
        channelPreferences: ["EMAIL"]
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
    valBehavior.registerValidator(SendNotificationCommand, new SendNotificationCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => contextObj);
    authBehavior.registerPolicy(SendNotificationCommand, new SendNotificationAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(
      SendNotificationCommand,
      new SendNotificationCommandHandler(repository, mapper)
    );
    mediator.registerHandler(
      GetNotificationByIdQuery,
      new GetNotificationByIdQueryHandler(repository, mapper)
    );

    return mediator;
  };

  it("should successfully record notification in draft/scheduled status with recipients", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new SendNotificationCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.reference).toBe("NTF-2027-000001");
    expect(result.value!.subject).toBe("Invoice obligation reminder");
    expect(result.value!.status).toBe("DRAFT");
    expect(result.value!.recipients).toHaveLength(1);
    expect(result.value!.recipients[0].userId).toBe("30eac582-b75c-4540-8b1d-95de2acfc792");
    expect(result.value!.recipients[0].email).toBe("customer@example.com");
  });

  it("should throw ValidationException when reference does not start with NTF-", async () => {
    const mediator = getPipelineMediator(validContext);

    const badDto = {
      ...validDto,
      reference: "123-REF"
    };

    await expect(mediator.send(new SendNotificationCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext);
    const command = new SendNotificationCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should fail when sending a duplicate notification reference number", async () => {
    const mediator = getPipelineMediator(validContext);

    const dupDto = {
      ...validDto,
      reference: "NTF-UNIQUE-DUP"
    };

    // First works
    const result1 = await mediator.send(new SendNotificationCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new SendNotificationCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load recorded notification details by ID via GetNotificationByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const dto = {
      ...validDto,
      reference: "NTF-2027-000009"
    };
    const registerRes = await mediator.send(new SendNotificationCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetNotificationByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.reference).toBe("NTF-2027-000009");
  });
});
