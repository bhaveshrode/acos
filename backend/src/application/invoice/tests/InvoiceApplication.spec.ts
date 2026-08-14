import { describe, it, expect } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Invoice Application components
import { CreateInvoiceCommand } from "../commands/CreateInvoiceCommand.js";
import { GetInvoiceByIdQuery } from "../queries/GetInvoiceByIdQuery.js";
import { CreateInvoiceCommandHandler } from "../handlers/CreateInvoiceCommandHandler.js";
import { GetInvoiceByIdQueryHandler } from "../handlers/GetInvoiceByIdQueryHandler.js";
import { CreateInvoiceCommandValidator } from "../validation/CreateInvoiceCommandValidator.js";
import { CreateInvoiceAuthPolicy } from "../authorization/CreateInvoiceAuthPolicy.js";
import { InvoiceMapper } from "../mapping/InvoiceMapper.js";
import { CreateInvoiceRequestDto } from "../dto/CreateInvoiceRequestDto.js";

// Domain Mock Repository
import { IInvoiceRepository } from "../../../business/invoice/repositories/IInvoiceRepository.js";
import { Invoice } from "../../../business/invoice/aggregates/Invoice.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { InvoiceNumber } from "../../../business/invoice/value-objects/InvoiceNumber.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock In-Memory Repository
class MockInvoiceRepository implements IInvoiceRepository {
  private readonly items = new Map<string, Invoice>();

  public async findById(id: InvoiceId): Promise<Result<Invoice>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Invoice not found."));
    return Result.ok(item);
  }

  public async findByInvoiceNumber(
    orgId: OrganizationId,
    number: InvoiceNumber
  ): Promise<Result<Invoice>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.invoiceNumber.equals(number)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Invoice not found."));
  }

  public async findByCustomer(
    orgId: OrganizationId,
    customerId: CustomerId
  ): Promise<Result<Invoice[]>> {
    const list = Array.from(this.items.values()).filter(
      (item) => item.organizationId.equals(orgId) && item.customerId.equals(customerId)
    );
    return Result.ok(list);
  }

  public async findByOrganization(orgId: OrganizationId): Promise<Result<Invoice[]>> {
    const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId));
    return Result.ok(list);
  }

  public async exists(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.invoiceNumber.equals(number)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(invoice: Invoice): Promise<Result<void>> {
    this.items.set(invoice.id.value, invoice);
    return Result.ok();
  }

  public async delete(id: InvoiceId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Invoice Module Application Layer Tests (Task 23.3)", () => {
  const repository = new MockInvoiceRepository();
  const mapper = new InvoiceMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";
  const customerIdVal = "30eac582-b75c-4540-8b1d-95de2acfc789";

  const validDto: CreateInvoiceRequestDto = {
    organizationId: orgId1,
    customerId: customerIdVal,
    invoiceNumber: "INV-2027-000001",
    currency: "USD",
    paymentTerms: "NET_30",
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    lines: [
      {
        description: "Billing consulting",
        quantity: 10,
        unitPrice: 150,
        taxRate: 10 // 10%
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
    valBehavior.registerValidator(CreateInvoiceCommand, new CreateInvoiceCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => contextObj);
    authBehavior.registerPolicy(CreateInvoiceCommand, new CreateInvoiceAuthPolicy());
    mediator.addBehavior(authBehavior);

    mediator.registerHandler(CreateInvoiceCommand, new CreateInvoiceCommandHandler(repository, mapper));
    mediator.registerHandler(GetInvoiceByIdQuery, new GetInvoiceByIdQueryHandler(repository, mapper));

    return mediator;
  };

  it("should successfully register invoice draft, add line items, and recalculate totals", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new CreateInvoiceCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.invoiceNumber).toBe("INV-2027-000001");
    expect(result.value!.status).toBe("DRAFT");
    expect(result.value!.subtotal).toBe(1500); // 10 * 150
    expect(result.value!.taxTotal).toBe(150); // 10% of 1500
    expect(result.value!.grandTotal).toBe(1650); // 1500 + 150
  });

  it("should throw ValidationException when lines array is empty", async () => {
    const mediator = getPipelineMediator(validContext);

    const badDto = {
      ...validDto,
      invoiceNumber: "INV-2027-000002",
      lines: []
    };

    await expect(mediator.send(new CreateInvoiceCommand(badDto))).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext);
    const command = new CreateInvoiceCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should return a failure result when trying to register a duplicate invoice number", async () => {
    const mediator = getPipelineMediator(validContext);

    const dupDto = {
      ...validDto,
      invoiceNumber: "INV-UNIQUE-DUP"
    };

    // First works
    const result1 = await mediator.send(new CreateInvoiceCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second fails
    const result2 = await mediator.send(new CreateInvoiceCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load registered invoice details by ID via GetInvoiceByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const dto = {
      ...validDto,
      invoiceNumber: "INV-2027-000009"
    };
    const registerRes = await mediator.send(new CreateInvoiceCommand(dto));
    const createdId = registerRes.value!.id;

    const queryRes = await mediator.send(new GetInvoiceByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.invoiceNumber).toBe("INV-2027-000009");
  });
});
