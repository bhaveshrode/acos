import { describe, it, expect, beforeEach } from "vitest";
import { FactoryContext } from "../FactoryContext.js";
import { FactoryRegistry } from "../FactoryRegistry.js";
import { FactoryResolver } from "../FactoryResolver.js";
import { PresentationFactory } from "../PresentationFactory.js";
import { ControllerFactory } from "../../controllers/ControllerFactory.js";
import { RouteFactory } from "../../routes/RouteFactory.js";
import { MiddlewareFactory } from "../../middleware/MiddlewareFactory.js";
import { AuthenticationFactory } from "../../authentication/AuthenticationFactory.js";
import { AuthorizationFactory } from "../../authorization/AuthorizationFactory.js";
import { ValidationFactory } from "../../validation/ValidationFactory.js";
import { SerializationFactory } from "../../serialization/SerializationFactory.js";
import { ExceptionFactory } from "../../exceptions/ExceptionFactory.js";
import { VersioningFactory } from "../../versioning/VersioningFactory.js";
import { HealthFactory } from "../../health/HealthFactory.js";
import { DocumentationFactory } from "../../documentation/DocumentationFactory.js";
import { WebSocketFactory } from "../../websocket/WebSocketFactory.js";
import { ResponseFactory } from "../../responses/ResponseFactory.js";
import { RequestFactory } from "../../requests/RequestFactory.js";
import { FilterFactory } from "../../filters/FilterFactory.js";
import { InterceptorFactory } from "../../interceptors/InterceptorFactory.js";

describe("Presentation Factories Component Tests (Task 58.5)", () => {
  beforeEach(() => {
    FactoryRegistry.clear();
  });

  describe("Models & Context", () => {
    it("should initialize FactoryContext and FactoryOptions properties correctly", () => {
      const mockContainer = { resolved: true };
      const ctx = new FactoryContext(mockContainer, { version: "v1" });
      expect(ctx.container.resolved).toBe(true);
      expect(ctx.options.version).toBe("v1");
    });
  });

  describe("Registry & Resolution", () => {
    it("should register and resolve builders using FactoryRegistry and FactoryResolver", () => {
      const mockCreator = (context: any) => ({ configured: true, container: context.container });
      FactoryRegistry.register("test-service", mockCreator);

      const resolvedCreator = FactoryRegistry.get("test-service");
      expect(resolvedCreator).toBe(mockCreator);

      const resolver = new FactoryResolver(new FactoryContext({ dev: true }));
      const serviceInstance = resolver.resolve<any>("test-service");
      expect(serviceInstance.configured).toBe(true);
      expect(serviceInstance.container.dev).toBe(true);
    });

    it("should throw if resolving unregistered builder keys", () => {
      const resolver = new FactoryResolver(new FactoryContext({}));
      expect(() => resolver.resolve("invalid-key")).toThrow("No creator registered for key: invalid-key");
    });
  });

  describe("PresentationFactory Composition Root", () => {
    it("should wire accessors to all 16 Presentation Layer subcomponent factories", () => {
      expect(PresentationFactory.getControllers()).toBe(ControllerFactory);
      expect(PresentationFactory.getRoutes()).toBe(RouteFactory);
      expect(PresentationFactory.getMiddleware()).toBe(MiddlewareFactory);
      expect(PresentationFactory.getAuthentication()).toBe(AuthenticationFactory);
      expect(PresentationFactory.getAuthorization()).toBe(AuthorizationFactory);
      expect(PresentationFactory.getValidation()).toBe(ValidationFactory);
      expect(PresentationFactory.getSerialization()).toBe(SerializationFactory);
      expect(PresentationFactory.getExceptions()).toBe(ExceptionFactory);
      expect(PresentationFactory.getVersioning()).toBe(VersioningFactory);
      expect(PresentationFactory.getHealth()).toBe(HealthFactory);
      expect(PresentationFactory.getDocumentation()).toBe(DocumentationFactory);
      expect(PresentationFactory.getWebSocket()).toBe(WebSocketFactory);
      expect(PresentationFactory.getResponses()).toBe(ResponseFactory);
      expect(PresentationFactory.getRequests()).toBe(RequestFactory);
      expect(PresentationFactory.getFilters()).toBe(FilterFactory);
      expect(PresentationFactory.getInterceptors()).toBe(InterceptorFactory);
    });
  });
});
