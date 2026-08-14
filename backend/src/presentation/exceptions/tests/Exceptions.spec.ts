import { describe, it, expect, beforeEach } from "vitest";
import { ExceptionContext } from "../ExceptionContext.js";
import { HttpException } from "../HttpException.js";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  TooManyRequestsException,
  InternalServerErrorException
} from "../HttpExceptions.js";
import { ExceptionMapper } from "../ExceptionMapper.js";
import { ErrorResponseBuilder } from "../ErrorResponseBuilder.js";
import { ExceptionRegistry } from "../ExceptionRegistry.js";
import { GlobalExceptionHandler } from "../GlobalExceptionHandler.js";
import { ExceptionFactory } from "../ExceptionFactory.js";

describe("Presentation Exceptions Component Tests (Task 46.7)", () => {
  beforeEach(() => {
    ExceptionMapper.clear();
    ExceptionRegistry.clear();
  });

  describe("ExceptionContext & HttpException", () => {
    it("should initialize exception context properties", () => {
      const now = new Date();
      const context = new ExceptionContext({
        correlationId: "corr-123",
        requestId: "req-456",
        path: "/api/test",
        method: "POST",
        timestamp: now
      });

      expect(context.props.correlationId).toBe("corr-123");
      expect(context.props.requestId).toBe("req-456");
      expect(context.props.path).toBe("/api/test");
      expect(context.props.method).toBe("POST");
      expect(context.props.timestamp).toBe(now);
    });

    it("should carry HTTP status code, message, and error code", () => {
      const error = new HttpException(418, "I am a teapot", "TEAPOT_ERROR", { field: "tea" });
      expect(error.statusCode).toBe(418);
      expect(error.message).toBe("I am a teapot");
      expect(error.errorCode).toBe("TEAPOT_ERROR");
      expect(error.details).toEqual({ field: "tea" });
    });
  });

  describe("Specialized Exceptions classes", () => {
    it("should represent specialized HTTP error conditions", () => {
      expect(new BadRequestException().statusCode).toBe(400);
      expect(new UnauthorizedException().statusCode).toBe(401);
      expect(new ForbiddenException().statusCode).toBe(403);
      expect(new NotFoundException().statusCode).toBe(404);
      expect(new ConflictException().statusCode).toBe(409);
      expect(new UnprocessableEntityException().statusCode).toBe(422);
      expect(new TooManyRequestsException().statusCode).toBe(429);
      expect(new InternalServerErrorException().statusCode).toBe(500);

      expect(new BadRequestException().errorCode).toBe("BAD_REQUEST");
      expect(new UnauthorizedException().errorCode).toBe("UNAUTHORIZED");
    });
  });

  describe("ExceptionMapper mappings translators", () => {
    it("should map default domain error names to HttpExceptions", () => {
      const validationErr = new Error("Validation issue");
      validationErr.name = "ValidationException";
      (validationErr as any).errors = [{ field: "name", message: "too short" }];

      const mappedVal = ExceptionMapper.map(validationErr);
      expect(mappedVal).toBeInstanceOf(BadRequestException);
      expect(mappedVal.message).toBe("Validation issue");
      expect(mappedVal.details).toEqual([{ field: "name", message: "too short" }]);

      const authErr = new Error("Auth issue");
      authErr.name = "AuthenticationException";
      const mappedAuth = ExceptionMapper.map(authErr);
      expect(mappedAuth).toBeInstanceOf(UnauthorizedException);

      const authzErr = new Error("Authz issue");
      authzErr.name = "AuthorizationException";
      const mappedAuthz = ExceptionMapper.map(authzErr);
      expect(mappedAuthz).toBeInstanceOf(ForbiddenException);

      const standardErr = new Error("Some critical error");
      const mappedStd = ExceptionMapper.map(standardErr);
      expect(mappedStd).toBeInstanceOf(InternalServerErrorException);
    });

    it("should map custom registered exceptions mapper functions", () => {
      ExceptionMapper.register("CustomDomainError", (err) => {
        return new ConflictException(`Mapped: ${err.message}`);
      });

      const customErr = new Error("custom message");
      customErr.name = "CustomDomainError";

      const mapped = ExceptionMapper.map(customErr);
      expect(mapped).toBeInstanceOf(ConflictException);
      expect(mapped.statusCode).toBe(409);
      expect(mapped.message).toBe("Mapped: custom message");
    });
  });

  describe("ErrorResponseBuilder and ExceptionRegistry", () => {
    it("should build error responses carrying timestamps, correlation keys and paths", () => {
      const builder = new ErrorResponseBuilder();
      const error = new BadRequestException("Name is empty", [{ field: "name" }]);
      const now = new Date();
      const context = new ExceptionContext({
        correlationId: "corr-789",
        requestId: "req-000",
        path: "/customers",
        method: "POST",
        timestamp: now
      });

      const payload = builder.build(error, context);
      expect(payload).toEqual({
        success: false,
        error: {
          message: "Name is empty",
          code: "BAD_REQUEST",
          statusCode: 400,
          timestamp: now.toISOString(),
          correlationId: "corr-789",
          requestId: "req-000",
          path: "/customers",
          details: [{ field: "name" }]
        }
      });
    });

    it("should registry custom status mappings", () => {
      ExceptionRegistry.register("ItemNotFound", 404);
      expect(ExceptionRegistry.getStatusCode("ItemNotFound")).toBe(404);
      expect(ExceptionRegistry.getStatusCode("Other")).toBeUndefined();
    });
  });

  describe("GlobalExceptionHandler & ExceptionFactory pipeline", () => {
    it("should handle generic Errors, mapping and formatting response payloads", () => {
      const builder = new ErrorResponseBuilder();
      const handler = new GlobalExceptionHandler(ExceptionMapper, builder);
      const now = new Date();
      const context = new ExceptionContext({
        correlationId: "corr-x",
        timestamp: now
      });

      const err = new Error("Generic crash");
      const result = handler.handle(err, context);

      expect(result.statusCode).toBe(500);
      expect(result.payload.success).toBe(false);
      expect(result.payload.error.message).toBe("Generic crash");
      expect(result.payload.error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(result.payload.error.correlationId).toBe("corr-x");
    });

    it("should build component classes using ExceptionFactory", () => {
      const builder = ExceptionFactory.createResponseBuilder();
      expect(builder).toBeInstanceOf(ErrorResponseBuilder);

      const handler = ExceptionFactory.createGlobalHandler(builder);
      expect(handler).toBeInstanceOf(GlobalExceptionHandler);
    });
  });
});
