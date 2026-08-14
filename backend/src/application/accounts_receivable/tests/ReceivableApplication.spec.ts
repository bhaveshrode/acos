import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Accounts Receivable Application components
import { RecordReceivableCommand } from "../commands/RecordReceivableCommand.js";
import { GetReceivableByIdQuery } from "../queries/GetReceivableByIdQuery.js";
import { RecordReceivableCommandHandler } from "../handlers/RecordReceivableCommandHandler.js";
import { GetReceivableByIdQueryHandler } from "../handlers/GetReceivableByIdQueryHandler.js";
import { RecordReceivableCommandValidator } from "../validation/RecordReceivableCommandValidator.js";
import { RecordReceivableAuthPolicy } from "../authorization/RecordReceivableAuthPolicy.js";
import { ReceivableMapper } from "../mapping/ReceivableMapper.js";
import { RecordReceivableRequestDto } from "../dto/RecordReceivableRequestDto.js";

// Domain Mock Repository
import { IAccountsReceivableRepository } from "../../../business/accounts_receivable/repositories/IAccountsReceivableRepository.js";
import { AccountsReceivable } from "../../../business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "../../../business/accounts_receivable/value-objects/ReceivableAccountId.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockAccountsReceivableRepository implements IAccountsReceivableRepository {
  private readonly items = new Map<string, AccountsReceivable>();

  public async findById(id: ReceivableAccountId): Promise<Result<AccountsReceivable>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Receivable account not found."));
    return Result.ok(item);
  }

  public async findByCustomer(
    orgId: OrganizationId,
    custId: CustomerId
  ): Promise<Result<AccountsReceivable>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerId.equals(custId)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Receivable account not found."));
  }

  public async findByInvoice(
    orgId: OrganizationId,
    invoiceId: InvoiceId
  ): Promise<Result<AccountsReceivable>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.entries.some((e) => e.invoiceId.equals(invoiceId))) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Receivable account not found."));
  }

  public async save(ar: AccountsReceivable): Promise<Result<void>> {
    this.items.set(ar.id.value, ar);
    return Result.ok();
  }

  public async delete(id: ReceivableAccountId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Accounts Receivable Module Application Layer Tests (Task 23.6)", () => {
  const repository = new MockAccountsReceivableRepository();
  const mapper = new ReceivableMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";
  const customerIdVal = "30eac582-b75c-4540-8b1d-95de2acfc789";
  const invoiceIdVal = "30eac582-b75c-4540-8b1d-95de2acfc790";

  const validDto: RecordReceivableRequestDto = {
    organizationId: orgId1,
    customerId: customerIdVal,
    invoiceId: invoiceIdVal,
    amount: 1500,
    currency: "USDC",
    dueDate: new Date(Date.now() + 15 * 86400 * 1000).toISOString()
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
    valBehavior.registerValidator(RecordReceivableCommand, new RecordReceivableCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => contextObj);
    authBehavior.registerPolicy(RecordReceivableCommand, new RecordReceivableAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(
      RecordReceivableCommand,
      new RecordReceivableCommandHandler(repository, mapper)
    );
    mediator.registerHandler(
      GetReceivableByIdQuery,
      new GetReceivableByIdQueryHandler(repository, mapper)
    );

    return mediator;
  };

  it("should successfully record invoice entry under customer AR account", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new RecordReceivableCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.status).toBe("CURRENT");
    expect(result.value!.entries).toHaveLength(1);
    expect(result.value!.entries[0].invoiceId).toBe(invoiceIdVal);
    expect(result.value!.entries[0].originalAmount).toBe(1500);
    expect(result.value!.entries[0].isPaid).toBe(false);
  });

  it("should throw ValidationException when amount is zero or negative", async () => {
    const mediator = getPipelineMediator(validContext);

    const badDto = {
      ...validDto,
      amount: -100
    };

    await expect(mediator.send(new RecordReceivableCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext);
    const command = new RecordReceivableCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should load recorded receivable account details by ID via GetReceivableByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const queryDto = {
      ...validDto,
      invoiceId: "30eac582-b75c-4540-8b1d-95de2acfc795"
    };
    const registerRes = await mediator.send(new RecordReceivableCommand(queryDto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetReceivableByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.entries.some((e) => e.invoiceId === "30eac582-b75c-4540-8b1d-95de2acfc795")).toBe(true);
  });
});
