import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Payment Application components
import { SubmitPaymentCommand } from "../commands/SubmitPaymentCommand.js";
import { GetPaymentByIdQuery } from "../queries/GetPaymentByIdQuery.js";
import { SubmitPaymentCommandHandler } from "../handlers/SubmitPaymentCommandHandler.js";
import { GetPaymentByIdQueryHandler } from "../handlers/GetPaymentByIdQueryHandler.js";
import { SubmitPaymentCommandValidator } from "../validation/SubmitPaymentCommandValidator.js";
import { SubmitPaymentAuthPolicy } from "../authorization/SubmitPaymentAuthPolicy.js";
import { PaymentMapper } from "../mapping/PaymentMapper.js";
import { SubmitPaymentRequestDto } from "../dto/SubmitPaymentRequestDto.js";

// Domain Mock Repository
import { IPaymentRepository } from "../../../business/payment/repositories/IPaymentRepository.js";
import { Payment } from "../../../business/payment/aggregates/Payment.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { PaymentReference } from "../../../business/payment/value-objects/PaymentReference.js";
import { TransactionHash } from "../../../business/payment/value-objects/TransactionHash.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockPaymentRepository implements IPaymentRepository {
  private readonly items = new Map<string, Payment>();

  public async findById(id: PaymentId): Promise<Result<Payment>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Payment not found."));
    return Result.ok(item);
  }

  public async findByReference(
    orgId: OrganizationId,
    ref: PaymentReference
  ): Promise<Result<Payment>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.reference.equals(ref)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Payment not found."));
  }

  public async findByTransactionHash(hash: TransactionHash): Promise<Result<Payment>> {
    for (const item of this.items.values()) {
      if (item.transactionHash && item.transactionHash.equals(hash)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Payment not found."));
  }

  public async findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<Payment[]>> {
    const list = Array.from(this.items.values()).filter((item) => {
      if (!item.organizationId.equals(orgId)) return false;
      return item.allocations.some((a) => a.invoiceId.equals(invoiceId));
    });
    return Result.ok(list);
  }

  public async existsHash(hash: TransactionHash): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.transactionHash && item.transactionHash.equals(hash)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(payment: Payment): Promise<Result<void>> {
    this.items.set(payment.id.value, payment);
    return Result.ok();
  }

  public async delete(id: PaymentId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Payment Module Application Layer Tests (Task 23.4)", () => {
  const repository = new MockPaymentRepository();
  const mapper = new PaymentMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";
  const customerIdVal = "30eac582-b75c-4540-8b1d-95de2acfc789";
  const invoiceIdVal = "30eac582-b75c-4540-8b1d-95de2acfc790";

  const validDto: SubmitPaymentRequestDto = {
    organizationId: orgId1,
    customerId: customerIdVal,
    reference: "PAY-2027-000001",
    amount: 1000,
    currency: "USDC",
    method: "USDC",
    invoiceId: invoiceIdVal,
    allocatedAmount: 1000
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
    valBehavior.registerValidator(SubmitPaymentCommand, new SubmitPaymentCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => contextObj);
    authBehavior.registerPolicy(SubmitPaymentCommand, new SubmitPaymentAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(SubmitPaymentCommand, new SubmitPaymentCommandHandler(repository, mapper));
    mediator.registerHandler(GetPaymentByIdQuery, new GetPaymentByIdQueryHandler(repository, mapper));

    return mediator;
  };

  it("should successfully record payment in PENDING status with allocations", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new SubmitPaymentCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.reference).toBe("PAY-2027-000001");
    expect(result.value!.status).toBe("PENDING");
    expect(result.value!.amount).toBe(1000);
    expect(result.value!.allocations).toHaveLength(1);
    expect(result.value!.allocations[0].invoiceId).toBe(invoiceIdVal);
    expect(result.value!.allocations[0].allocatedAmount).toBe(1000);
  });

  it("should throw ValidationException when reference does not start with PAY-", async () => {
    const mediator = getPipelineMediator(validContext);

    const badDto = {
      ...validDto,
      reference: "123-REF"
    };

    await expect(mediator.send(new SubmitPaymentCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext);
    const command = new SubmitPaymentCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should fail when recording a duplicate payment reference number", async () => {
    const mediator = getPipelineMediator(validContext);

    const dupDto = {
      ...validDto,
      reference: "PAY-UNIQUE-DUP"
    };

    // First works
    const result1 = await mediator.send(new SubmitPaymentCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new SubmitPaymentCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load registered payment details by ID via GetPaymentByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const dto = {
      ...validDto,
      reference: "PAY-2027-000009"
    };
    const registerRes = await mediator.send(new SubmitPaymentCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetPaymentByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.reference).toBe("PAY-2027-000009");
  });
});
