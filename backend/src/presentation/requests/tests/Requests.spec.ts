import { describe, it, expect, beforeEach } from "vitest";
import { RequestContext } from "../RequestContext.js";
import { ApiRequest } from "../ApiRequest.js";
import { RequestMetadata } from "../RequestMetadata.js";
import { RequestBinder } from "../RequestBinder.js";
import { BodyExtractor } from "../BodyExtractor.js";
import { QueryExtractor } from "../QueryExtractor.js";
import { RouteParameterExtractor } from "../RouteParameterExtractor.js";
import { HeaderExtractor } from "../HeaderExtractor.js";
import { RequestBuilder } from "../RequestBuilder.js";
import { RequestNormalizer } from "../RequestNormalizer.js";
import { RequestHeadersParser } from "../RequestHeadersParser.js";
import { CorrelationResolver } from "../CorrelationResolver.js";
import { RequestMetadataBuilder } from "../RequestMetadataBuilder.js";
import { RequestRegistry } from "../RequestRegistry.js";
import { RequestFactory } from "../RequestFactory.js";

class MockDto {
  public id!: string;
  public name!: string;
  constructor(data: any) {
    Object.assign(this, data);
  }
}

describe("Presentation Requests Component Tests (Task 55.7)", () => {
  beforeEach(() => {
    RequestRegistry.clear();
  });

  describe("Models & Context", () => {
    it("should initialize RequestContext and ApiRequest structures", () => {
      const meta = new RequestMetadata({
        correlationId: "c-1",
        requestId: "r-1",
        timestamp: new Date(),
        executionStartTimeMs: Date.now()
      });
      const req = new ApiRequest({ text: "body" }, { q: "1" }, { p: "id" }, { "user-agent": "ACOS" });
      const ctx = new RequestContext(req, meta);

      expect(ctx.request.body.text).toBe("body");
      expect(ctx.metadata.props.correlationId).toBe("c-1");
    });
  });

  describe("Request Binding & Extraction", () => {
    it("should extract body, query, path parameters, and headers correctly", () => {
      const requestMock = {
        body: { amount: 50 },
        query: { status: "pending" },
        params: { id: "101" },
        headers: { authorization: "Bearer token" }
      };

      expect(new BodyExtractor().extract(requestMock)).toEqual({ amount: 50 });
      expect(new QueryExtractor().extract(requestMock)).toEqual({ status: "pending" });
      expect(new RouteParameterExtractor().extract(requestMock)).toEqual({ id: "101" });
      expect(new HeaderExtractor().extract(requestMock)).toEqual({ authorization: "Bearer token" });
    });

    it("should bind raw HTTP sources to target DTO objects", () => {
      const binder = new RequestBinder();
      const requestMock = {
        body: { name: "ACOS" },
        query: { foo: "bar" },
        params: { id: "999" }
      };

      const resultObj = binder.bind(requestMock);
      expect(resultObj).toEqual({ id: "999", foo: "bar", name: "ACOS" });

      const resultDto = binder.bind(requestMock, MockDto);
      expect(resultDto).toBeInstanceOf(MockDto);
      expect(resultDto.id).toBe("999");
      expect(resultDto.name).toBe("ACOS");
    });
  });

  describe("Builders & Normalizers", () => {
    it("should assemble unified request wrappers using RequestBuilder", () => {
      const builder = new RequestBuilder();
      const requestMock = {
        body: { val: 1 },
        query: { q: "hello" },
        params: { id: "a" },
        headers: { "x-key": "v" }
      };

      const apiReq = builder.build(requestMock);
      expect(apiReq.body).toEqual({ val: 1 });
      expect(apiReq.query).toEqual({ q: "hello" });
      expect(apiReq.params).toEqual({ id: "a" });
      expect(apiReq.headers["x-key"]).toBe("v");
    });

    it("should coerce types cleanly using RequestNormalizer", () => {
      const normalizer = new RequestNormalizer();
      const coerced = normalizer.normalize({
        isActive: "true",
        isDeleted: "false",
        count: "42",
        created: "2026-08-03T18:00:00.000Z",
        name: "standard"
      });

      expect(coerced.isActive).toBe(true);
      expect(coerced.isDeleted).toBe(false);
      expect(coerced.count).toBe(42);
      expect(coerced.created).toBeInstanceOf(Date);
      expect(coerced.name).toBe("standard");
    });
  });

  describe("Request Metadata Processors", () => {
    it("should parse headers and resolve correlation traces", () => {
      const headers = {
        "user-agent": "Mozilla",
        "x-forwarded-for": "192.168.1.1",
        "x-correlation-id": "corr-resolved"
      };

      const parser = new RequestHeadersParser();
      const parsed = parser.parse(headers);
      expect(parsed.userAgent).toBe("Mozilla");
      expect(parsed.clientIp).toBe("192.168.1.1");

      const resolver = new CorrelationResolver();
      expect(resolver.resolve(headers)).toBe("corr-resolved");
      expect(resolver.resolve({})).toContain("corr-");
    });

    it("should generate full tracking metadata using RequestMetadataBuilder", () => {
      const builder = new RequestMetadataBuilder();
      const requestMock = {
        headers: {
          "x-request-id": "req-999",
          "x-correlation-id": "corr-888",
          "user-agent": "ACOS-Client"
        },
        ip: "127.0.0.1"
      };

      const meta = builder.build(requestMock);
      expect(meta.props.requestId).toBe("req-999");
      expect(meta.props.correlationId).toBe("corr-888");
      expect(meta.props.userAgent).toBe("ACOS-Client");
      expect(meta.props.clientIp).toBe("127.0.0.1");
      expect(meta.props.timestamp).toBeInstanceOf(Date);
      expect(meta.props.executionStartTimeMs).toBeDefined();
    });
  });

  describe("Registries & Factories setups", () => {
    it("should catalog binders using RequestRegistry", () => {
      const binder = new RequestBinder();
      expect(RequestRegistry.get("test")).toBeUndefined();

      RequestRegistry.register("test", binder);
      expect(RequestRegistry.get("test")).toBe(binder);
    });

    it("should instantiate builders configurations using RequestFactory", () => {
      expect(RequestFactory.createBuilder()).toBeInstanceOf(RequestBuilder);
      expect(RequestFactory.createBinder()).toBeInstanceOf(RequestBinder);
      expect(RequestFactory.createNormalizer()).toBeInstanceOf(RequestNormalizer);
      expect(RequestFactory.createMetadataBuilder()).toBeInstanceOf(RequestMetadataBuilder);
      expect(RequestFactory.createBodyExtractor()).toBeInstanceOf(BodyExtractor);
      expect(RequestFactory.createQueryExtractor()).toBeInstanceOf(QueryExtractor);
      expect(RequestFactory.createRouteExtractor()).toBeInstanceOf(RouteParameterExtractor);
      expect(RequestFactory.createHeaderExtractor()).toBeInstanceOf(HeaderExtractor);
    });
  });
});
