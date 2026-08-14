import { describe, it, expect, vi } from "vitest";
import { Mediator } from "../../foundation/pipeline/Mediator.js";
import { ValidationBehavior } from "../../foundation/pipeline/ValidationBehavior.js";
import { AuthorizationBehavior } from "../../foundation/pipeline/AuthorizationBehavior.js";
import { IExecutionContext } from "../../foundation/context/IExecutionContext.js";
import { ValidationException } from "../../foundation/exceptions/ValidationException.js";
import { AuthorizationException } from "../../foundation/exceptions/AuthorizationException.js";

// Customer Application components
import { CreateCustomerCommand } from "../commands/CreateCustomerCommand.js";
import { GetCustomerByIdQuery } from "../queries/GetCustomerByIdQuery.js";
import { CreateCustomerCommandHandler } from "../handlers/CreateCustomerCommandHandler.js";
import { GetCustomerByIdQueryHandler } from "../handlers/GetCustomerByIdQueryHandler.js";
import { CreateCustomerCommandValidator } from "../validation/CreateCustomerCommandValidator.js";
import { CreateCustomerAuthPolicy } from "../authorization/CreateCustomerAuthPolicy.js";
import { CustomerMapper } from "../mapping/CustomerMapper.js";
import { CreateCustomerRequestDto } from "../dto/CreateCustomerRequestDto.js";

// Domain Mock Repository
import { ICustomerRepository } from "../../../business/customer/repositories/ICustomerRepository.js";
import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "../../../business/customer/value-objects/CustomerNumber.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// In-Memory Repository implementation
class MockCustomerRepository implements ICustomerRepository {
  private readonly items = new Map<string, Customer>();

  public async findById(id: CustomerId): Promise<Result<Customer>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound("Customer not found."));
    return Result.ok(item);
  }

  public async findByCustomerNumber(
    orgId: OrganizationId,
    number: CustomerNumber
  ): Promise<Result<Customer>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerNumber.equals(number)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Customer not found."));
  }

  public async findByOrganization(orgId: OrganizationId): Promise<Result<Customer[]>> {
    const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId));
    return Result.ok(list);
  }

  public async exists(orgId: OrganizationId, number: CustomerNumber): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerNumber.equals(number)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(customer: Customer): Promise<Result<void>> {
    this.items.set(customer.id.value, customer);
    return Result.ok();
  }

  public async delete(id: CustomerId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }
}

describe("Customer Module Application Layer Tests (Task 22.4)", () => {
  const repository = new MockCustomerRepository();
  const mapper = new CustomerMapper();

  const orgId1 = "30eac582-b75c-4540-8b1d-95de2acfc788";
  const orgId2 = "a8b7c6d5-e4f3-a2b1-0987-654321fedcba";

  const validDto: CreateCustomerRequestDto = {
    organizationId: orgId1,
    customerNumber: "CUST-000001",
    name: "Acme Corp",
    companyName: "Acme Industries",
    taxIdentifier: "VAT-998877",
    primaryContact: {
      name: "John Doe",
      email: "john@acme.com",
      phone: "+15550000"
    },
    billingAddress: {
      line1: "123 Commerce St",
      city: "Metropolis",
      state: "NY",
      postalCode: "10001",
      country: "USA"
    }
  };

  // Execution contexts
  const validContext: IExecutionContext = {
    userId: "30eac582-b75c-4540-8b1d-95de2acfc789",
    organizationId: orgId1,
    correlationId: "corr-111",
    timestamp: new Date()
  };

  const invalidContext: IExecutionContext = {
    userId: "30eac582-b75c-4540-8b1d-95de2acfc790",
    organizationId: orgId2,
    correlationId: "corr-222",
    timestamp: new Date()
  };

  const getPipelineMediator = (context: IExecutionContext) => {
    const mediator = new Mediator();
    
    // Register pipeline decorators
    const valBehavior = new ValidationBehavior<any, any>();
    valBehavior.registerValidator(CreateCustomerCommand, new CreateCustomerCommandValidator());
    mediator.addBehavior(valBehavior);

    const authBehavior = new AuthorizationBehavior<any, any>(() => context);
    authBehavior.registerPolicy(CreateCustomerCommand, new CreateCustomerAuthPolicy());
    mediator.addBehavior(authBehavior);

    // Register handlers
    mediator.registerHandler(CreateCustomerCommand, new CreateCustomerCommandHandler(repository, mapper));
    mediator.registerHandler(GetCustomerByIdQuery, new GetCustomerByIdQueryHandler(repository, mapper));

    return mediator;
  };

  it("should successfully register customer when request validation and auth policy pass", async () => {
    const mediator = getPipelineMediator(validContext);
    const command = new CreateCustomerCommand(validDto);

    const result = await mediator.send(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).not.toBeNull();
    expect(result.value!.customerNumber).toBe("CUST-000001");
    expect(result.value!.name).toBe("Acme Corp");
    expect(result.value!.contacts[0].name).toBe("John Doe");
    expect(result.value!.contacts[0].email).toBe("john@acme.com");
    expect(result.value!.addresses[0].line1).toBe("123 Commerce St");
  });

  it("should throw ValidationException when structural parameters are invalid", async () => {
    const mediator = getPipelineMediator(validContext);

    // Empty name
    const invalidDto = {
      ...validDto,
      name: "",
      customerNumber: "CUST-000002"
    };

    await expect(mediator.send(new CreateCustomerCommand(invalidDto))).rejects.toThrow(ValidationException);
  });

  it("should throw AuthorizationException when user organization does not match request organization", async () => {
    const mediator = getPipelineMediator(invalidContext); // org-different vs org-123
    const command = new CreateCustomerCommand(validDto);

    await expect(mediator.send(command)).rejects.toThrow(AuthorizationException);
  });

  it("should return a failure result when trying to register a duplicate customer number", async () => {
    const mediator = getPipelineMediator(validContext);

    // First creation works (registered under CUST-UNIQUE-DUP)
    const dupDto = {
      ...validDto,
      customerNumber: "CUST-UNIQUE-DUP"
    };
    const result1 = await mediator.send(new CreateCustomerCommand(dupDto));
    expect(result1.isSuccess).toBe(true);

    // Second creation fails due to duplicate number check
    const result2 = await mediator.send(new CreateCustomerCommand(dupDto));
    expect(result2.isSuccess).toBe(false);
    expect(result2.errors[0]).toContain("already exists");
  });

  it("should load registered customer details by ID via GetCustomerByIdQuery", async () => {
    const mediator = getPipelineMediator(validContext);

    const dto = {
      ...validDto,
      customerNumber: "CUST-000005"
    };
    const registerRes = await mediator.send(new CreateCustomerCommand(dto));
    const createdId = registerRes.value!.id;

    // Dispatch Query
    const queryRes = await mediator.send(new GetCustomerByIdQuery(createdId));
    expect(queryRes.isSuccess).toBe(true);
    expect(queryRes.value!.id).toBe(createdId);
    expect(queryRes.value!.customerNumber).toBe("CUST-000005");
  });
});
