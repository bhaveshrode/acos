import { describe, it, expect, beforeEach } from "vitest";
import { ApiDocument } from "../ApiDocument.js";
import { EndpointDocument } from "../EndpointDocument.js";
import { SchemaDocument } from "../SchemaDocument.js";
import { DocumentationOptions } from "../DocumentationOptions.js";
import { ControllerMetadataProvider } from "../ControllerMetadataProvider.js";
import { RouteMetadataProvider } from "../RouteMetadataProvider.js";
import { ModelMetadataProvider } from "../ModelMetadataProvider.js";
import { SecurityMetadataProvider } from "../SecurityMetadataProvider.js";
import { OpenApiBuilder } from "../OpenApiBuilder.js";
import { SchemaGenerator } from "../SchemaGenerator.js";
import { OperationBuilder } from "../OperationBuilder.js";
import { DocumentationRegistry } from "../DocumentationRegistry.js";
import { DocumentationGenerator } from "../DocumentationGenerator.js";
import { DocumentationController } from "../DocumentationController.js";
import { DocumentationFactory } from "../DocumentationFactory.js";

describe("Presentation Documentation Component Tests (Task 52.7)", () => {
  beforeEach(() => {
    DocumentationRegistry.clear();
  });

  describe("Models & Options", () => {
    it("should capture API description model tags", () => {
      const ep = new EndpointDocument("GET", "/test", "Test endpoint");
      const sch = new SchemaDocument("UserDto", "object", { username: { type: "string" } });
      const doc = new ApiDocument("ACOS API", "1.0", [ep], [sch]);

      expect(doc.title).toBe("ACOS API");
      expect(doc.version).toBe("1.0");
      expect(doc.endpoints.length).toBe(1);
      expect(doc.schemas.length).toBe(1);

      const opts = new DocumentationOptions("Title", "2.0");
      expect(opts.title).toBe("Title");
      expect(opts.version).toBe("2.0");
    });
  });

  describe("Metadata Providers", () => {
    it("should return controller info summaries", () => {
      const provider = new ControllerMetadataProvider();
      const info = provider.getControllerInfo("CustomerController");
      expect(info.summary).toContain("CustomerController");
    });

    it("should resolve route method strings layouts", () => {
      const provider = new RouteMetadataProvider();
      const info = provider.getRouteSummary("post", "/customers");
      expect(info).toBe("POST /customers");
    });

    it("should extract model schemas fields properties", () => {
      const provider = new ModelMetadataProvider();
      const info = provider.getModelProperties("InvoiceDto");
      expect(info.id).toEqual({ type: "string", format: "uuid" });
    });

    it("should return security rules matching routes patterns", () => {
      const provider = new SecurityMetadataProvider();
      expect(provider.getSecurityRequirements("/users/login")).toEqual([]);
      expect(provider.getSecurityRequirements("/customers")).toEqual(["BearerAuth"]);
    });
  });

  describe("Specification Builders", () => {
    it("should assemble OpenAPI v3 compliant specs JSON objects", () => {
      const builder = new OpenApiBuilder();
      const ep = new EndpointDocument("GET", "/customers", "Get Customers", [], undefined, { "200": "Success" });
      const sch = new SchemaDocument("CustomerDto", "object", { name: { type: "string" } });
      const doc = new ApiDocument("ACOS test", "1.0.0", [ep], [sch]);

      const spec = builder.build(doc);

      expect(spec.openapi).toBe("3.0.0");
      expect(spec.info.title).toBe("ACOS test");
      expect(spec.paths["/customers"].get.summary).toBe("Get Customers");
      expect(spec.paths["/customers"].get.responses["200"].description).toBe("Success");
      expect(spec.components.schemas.CustomerDto.type).toBe("object");
    });

    it("should create operations and schemas via helpers", () => {
      const schemaGen = new SchemaGenerator();
      const sch = schemaGen.generate("UserDto", "object", { age: { type: "integer" } });
      expect(sch.name).toBe("UserDto");

      const opGen = new OperationBuilder();
      const op = opGen.createOperation("GET", "/invoices", "list invoices");
      expect(op.method).toBe("GET");
      expect(op.path).toBe("/invoices");
    });
  });

  describe("Registry, Generator & Controllers services", () => {
    it("should dynamic register spec items in DocumentationRegistry", () => {
      expect(DocumentationRegistry.getEndpoints().length).toBe(0);
      DocumentationRegistry.registerEndpoint(new EndpointDocument("POST", "/invoices", "Issue Invoice"));
      DocumentationRegistry.registerSchema(new SchemaDocument("InvoiceDto", "object"));

      expect(DocumentationRegistry.getEndpoints().length).toBe(1);
      expect(DocumentationRegistry.getSchemas().length).toBe(1);
    });

    it("should compile registry metadata specs using DocumentationGenerator", () => {
      DocumentationRegistry.registerEndpoint(new EndpointDocument("GET", "/ready", "Ready status"));
      const gen = new DocumentationGenerator(new DocumentationOptions("App", "1.1"));
      const doc = gen.generate();

      expect(doc.title).toBe("App");
      expect(doc.endpoints.length).toBe(1);
    });

    it("should deliver JSON specifications via DocumentationController", () => {
      DocumentationRegistry.registerEndpoint(new EndpointDocument("GET", "/live", "Live status"));
      const gen = new DocumentationGenerator(new DocumentationOptions("TestApp", "2.0"));
      const controller = new DocumentationController(gen, new OpenApiBuilder());

      const res = controller.handleDocs();
      expect(res.statusCode).toBe(200);
      expect(res.payload.info.title).toBe("TestApp");
      expect(res.payload.paths["/live"].get.summary).toBe("Live status");
    });
  });

  describe("DocumentationFactory builder setups", () => {
    it("should build generators and controllers cleanly", () => {
      const opts = new DocumentationOptions();
      const generator = DocumentationFactory.createGenerator(opts);
      const controller = DocumentationFactory.createController(generator);

      expect(generator).toBeInstanceOf(DocumentationGenerator);
      expect(controller).toBeInstanceOf(DocumentationController);
      expect(DocumentationFactory.createControllerMetadataProvider()).toBeInstanceOf(ControllerMetadataProvider);
      expect(DocumentationFactory.createRouteMetadataProvider()).toBeInstanceOf(RouteMetadataProvider);
      expect(DocumentationFactory.createModelMetadataProvider()).toBeInstanceOf(ModelMetadataProvider);
      expect(DocumentationFactory.createSecurityMetadataProvider()).toBeInstanceOf(SecurityMetadataProvider);
      expect(DocumentationFactory.createSchemaGenerator()).toBeInstanceOf(SchemaGenerator);
      expect(DocumentationFactory.createOperationBuilder()).toBeInstanceOf(OperationBuilder);
    });
  });
});
