import { describe, it, expect, vi } from "vitest";
import { Mediator } from "../pipeline/Mediator.js";
import { ICommand } from "../commands/ICommand.js";
import { IQuery } from "../queries/IQuery.js";
import { IRequestHandler } from "../handlers/IRequestHandler.js";
import { ApplicationResult } from "../results/ApplicationResult.js";
import { IExecutionContext } from "../context/IExecutionContext.js";
import { ILogger } from "../../../foundation/contracts/system/ILogger.js";
import { LoggingBehavior } from "../pipeline/LoggingBehavior.js";
import { IRequestValidator } from "../validation/IRequestValidator.js";
import { ValidationBehavior } from "../pipeline/ValidationBehavior.js";
import { ValidationException } from "../exceptions/ValidationException.js";
import { IAuthPolicy } from "../authorization/IAuthPolicy.js";
import { AuthorizationBehavior } from "../pipeline/AuthorizationBehavior.js";
import { AuthorizationException } from "../exceptions/AuthorizationException.js";
import { IUnitOfWork } from "../transactions/IUnitOfWork.js";
import { TransactionBehavior } from "../pipeline/TransactionBehavior.js";

// Dummy Command & Query
class SampleCommand implements ICommand<ApplicationResult<string>> {
  constructor(public readonly data: string) {}
}

class SampleQuery implements IQuery<ApplicationResult<string>> {
  constructor(public readonly id: string) {}
}

// Dummy Handlers
class SampleCommandHandler implements IRequestHandler<SampleCommand, ApplicationResult<string>> {
  public async handle(request: SampleCommand): Promise<ApplicationResult<string>> {
    return ApplicationResult.success(`Processed command: ${request.data}`);
  }
}

class SampleQueryHandler implements IRequestHandler<SampleQuery, ApplicationResult<string>> {
  public async handle(request: SampleQuery): Promise<ApplicationResult<string>> {
    return ApplicationResult.success(`Processed query: ${request.id}`);
  }
}

describe("Application Foundation Mediator & Pipeline (Task 21.4)", () => {
  it("should resolve and execute command handler directly via Mediator", async () => {
    const mediator = new Mediator();
    mediator.registerHandler(SampleCommand, new SampleCommandHandler());

    const result = await mediator.send(new SampleCommand("Hello"));
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe("Processed command: Hello");
  });

  it("should execute LoggingBehavior and output entries", async () => {
    const mediator = new Mediator();
    mediator.registerHandler(SampleCommand, new SampleCommandHandler());

    const mockLogger: ILogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      critical: vi.fn(),
      withContext: vi.fn().mockReturnThis()
    };

    mediator.addBehavior(new LoggingBehavior(mockLogger));

    await mediator.send(new SampleCommand("TestLog"));
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("[Mediator] Processing request: SampleCommand"),
      expect.any(Object)
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("[Mediator] Finished request: SampleCommand")
    );
  });

  it("should trigger validation and throw ValidationException on invalid requests", async () => {
    const mediator = new Mediator();
    mediator.registerHandler(SampleCommand, new SampleCommandHandler());

    const validatorBehavior = new ValidationBehavior<any, any>();
    
    // Validator requiring data not to be empty
    const validator: IRequestValidator<SampleCommand> = {
      validate(request: SampleCommand): string[] {
        return request.data.trim() === "" ? ["Data cannot be empty."] : [];
      }
    };

    validatorBehavior.registerValidator(SampleCommand, validator);
    mediator.addBehavior(validatorBehavior);

    // Valid command passes
    const passResult = await mediator.send(new SampleCommand("valid"));
    expect(passResult.isSuccess).toBe(true);

    // Empty command fails
    await expect(mediator.send(new SampleCommand(""))).rejects.toThrow(ValidationException);
  });

  it("should trigger authorization policies and check ExecutionContext details", async () => {
    const mediator = new Mediator();
    mediator.registerHandler(SampleCommand, new SampleCommandHandler());

    const mockContext: IExecutionContext = {
      userId: "user-123",
      organizationId: "org-456",
      correlationId: "corr-789",
      timestamp: new Date()
    };

    const authBehavior = new AuthorizationBehavior<any, any>(() => mockContext);

    // Policy restricting command to user-123
    const policy: IAuthPolicy<SampleCommand> = {
      async isAuthorized(request: SampleCommand, context: IExecutionContext): Promise<boolean> {
        return context.userId === "user-123";
      }
    };

    authBehavior.registerPolicy(SampleCommand, policy);
    mediator.addBehavior(authBehavior);

    const result = await mediator.send(new SampleCommand("auth-check"));
    expect(result.isSuccess).toBe(true);
  });

  it("should enforce transactions for Commands and bypass them for Queries", async () => {
    const mediator = new Mediator();
    mediator.registerHandler(SampleCommand, new SampleCommandHandler());
    mediator.registerHandler(SampleQuery, new SampleQueryHandler());

    const mockUow: IUnitOfWork = {
      begin: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn()
    };

    mediator.addBehavior(new TransactionBehavior(mockUow));

    // Command should run inside UoW transaction
    await mediator.send(new SampleCommand("data"));
    expect(mockUow.begin).toHaveBeenCalled();
    expect(mockUow.commit).toHaveBeenCalled();

    // Query should bypass UoW transaction
    vi.clearAllMocks();
    await mediator.send(new SampleQuery("id"));
    expect(mockUow.begin).not.toHaveBeenCalled();
    expect(mockUow.commit).not.toHaveBeenCalled();
  });
});
