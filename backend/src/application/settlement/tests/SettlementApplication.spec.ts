import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Settlement Application components
import { ProcessSettlementCommand } from "../commands/ProcessSettlementCommand.js";
import { GetSettlementByIdQuery } from "../queries/GetSettlementByIdQuery.js";
import { ProcessSettlementCommandHandler } from "../handlers/ProcessSettlementCommandHandler.js";
import { GetSettlementByIdQueryHandler } from "../handlers/GetSettlementByIdQueryHandler.js";
import { ProcessSettlementCommandValidator } from "../validation/ProcessSettlementCommandValidator.js";
import { ProcessSettlementAuthPolicy } from "../authorization/ProcessSettlementAuthPolicy.js";
import { SettlementMapper } from "../mapping/SettlementMapper.js";
import { ProcessSettlementRequestDto } from "../dto/ProcessSettlementRequestDto.js";

// Domain Mock Repository
import { ISettlementRepository } from "../../../business/settlement/repositories/ISettlementRepository.js";
import { Settlement } from "../../../business/settlement/aggregates/Settlement.js";
import { SettlementId } from "../../../business/settlement/value-objects/SettlementId.js";
import { SettlementReference } from "../../../business/settlement/value-objects/SettlementReference.js";
import { TransactionHash } from "../../../business/settlement/value-objects/TransactionHash.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockSettlementRepository implements ISettlementRepository {
  private readonly items = new Map<string, Settlement>();

  public async findById(id: SettlementId): Promise<Result<Settlement>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Settlement not found."));
    return Result.ok(item);
  }

  public async findByReference(
    orgId: OrganizationId,
    ref: SettlementReference
  ): Promise<Result<Settlement>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.reference.equals(ref)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Settlement not found."));
  }

  public async findByPayment(orgId: OrganizationId, paymentId: PaymentId): Promise<Result<Settlement>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.paymentId.equals(paymentId)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Settlement not found."));
  }

  public async findByTransactionHash(hash: TransactionHash): Promise<Result<Settlement>> {
    for (const item of this.items.values()) {
      if (item.transactionHash && item.transactionHash.equals(hash)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Settlement not found."));
  }

  public async save(settlement: Settlement): Promise<Result<void>> {
    this.items.set(settlement.id.value, settlement);
    return Result.ok();
  }

  public async delete(id: SettlementId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Settlement Module Application Layer Tests (Task 23.5)", () => {
  const repository = new MockSettlementRepository();
  const mapper = new SettlementMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";
  const paymentIdVal = "30eac582-b75c-4540-8b1d-95de2acfc789";

  const validDto: ProcessSettlementRequestDto = {
    organizationId: orgId1,
    paymentId: paymentIdVal,
    reference: "SET-2027-000001",
    amount: 1000,
    currency: "USDC",
    method: "BLOCKCHAIN",
    confirmationThreshold: 12
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
    valBehavior.registerValidator(ProcessSettlementCommand, new ProcessSettlementCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => contextObj);
    authBehavior.registerPolicy(ProcessSettlementCommand, new ProcessSettlementAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(
      ProcessSettlementCommand,
      new ProcessSettlementCommandHandler(repository, mapper)
    );
    mediator.registerHandler(
      GetSettlementByIdQuery,
      new GetSettlementByIdQueryHandler(repository, mapper)
    );

    return mediator;
  };

  it("should successfully record settlement in PENDING status", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new ProcessSettlementCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.reference).toBe("SET-2027-000001");
    expect(result.value!.status).toBe("PENDING");
    expect(result.value!.amount).toBe(1000);
    expect(result.value!.confirmationThreshold).toBe(12);
  });

  it("should throw ValidationException when reference does not start with SET-", async () => {
    const mediator = getPipelineMediator(validContext);

    const badDto = {
      ...validDto,
      reference: "123-REF"
    };

    await expect(mediator.send(new ProcessSettlementCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext);
    const command = new ProcessSettlementCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should fail when recording a duplicate settlement reference number", async () => {
    const mediator = getPipelineMediator(validContext);

    const dupDto = {
      ...validDto,
      reference: "SET-UNIQUE-DUP"
    };

    // First works
    const result1 = await mediator.send(new ProcessSettlementCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new ProcessSettlementCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load registered settlement details by ID via GetSettlementByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const dto = {
      ...validDto,
      reference: "SET-2027-000009"
    };
    const registerRes = await mediator.send(new ProcessSettlementCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetSettlementByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.reference).toBe("SET-2027-000009");
  });
});
