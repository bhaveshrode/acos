import { describe, it, expect, beforeEach } from "vitest";
import { ResponseContext } from "../ResponseContext.js";
import { ApiResponse } from "../ApiResponse.js";
import { PagedResponse } from "../PagedResponse.js";
import { ErrorResponse } from "../ErrorResponse.js";
import { SuccessResponseBuilder } from "../SuccessResponseBuilder.js";
import { ErrorResponseBuilder } from "../ErrorResponseBuilder.js";
import { PagedResponseBuilder } from "../PagedResponseBuilder.js";
import { ResponseHeadersBuilder } from "../ResponseHeadersBuilder.js";
import { ResponseMetadataBuilder } from "../ResponseMetadataBuilder.js";
import { PaginationBuilder } from "../PaginationBuilder.js";
import { LinkBuilder } from "../LinkBuilder.js";
import { ResponseRegistry } from "../ResponseRegistry.js";
import { ResponseFactory } from "../ResponseFactory.js";

describe("Presentation Responses Component Tests (Task 54.7)", () => {
  beforeEach(() => {
    ResponseRegistry.clear();
  });

  describe("Models & Context", () => {
    it("should initialize ResponseContext and ApiResponse properties correctly", () => {
      const ctx = new ResponseContext({
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        correlationId: "corr-1"
      });
      expect(ctx.props.statusCode).toBe(200);
      expect(ctx.props.correlationId).toBe("corr-1");

      const response = new ApiResponse(true, { value: "ACOS" });
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ value: "ACOS" });
    });

    it("should construct ErrorResponse structure containing custom codes", () => {
      const err = new ErrorResponse({
        message: "Resource not found",
        code: "NOT_FOUND",
        details: { id: 123 }
      });
      expect(err.success).toBe(false);
      expect(err.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Response Builders", () => {
    it("should build success payload wraps", () => {
      const builder = new SuccessResponseBuilder();
      const res = builder.build({ count: 10 }, { source: "test" });
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ count: 10 });
      expect(res.metadata).toEqual({ source: "test" });
    });

    it("should format error details payloads", () => {
      const builder = new ErrorResponseBuilder();
      const res = builder.build("Access denied", "FORBIDDEN", { requiredRole: "Admin" });
      expect(res.success).toBe(false);
      expect(res.error.message).toBe("Access denied");
      expect(res.error.code).toBe("FORBIDDEN");
      expect(res.error.details.requiredRole).toBe("Admin");
    });
  });

  describe("Headers & Metadata", () => {
    it("should build response header properties fluently", () => {
      const headers = new ResponseHeadersBuilder()
        .withCorrelationId("corr-hdr")
        .withCacheControl("no-store")
        .withETag("etag-val")
        .build();

      expect(headers["Correlation-Id"]).toBe("corr-hdr");
      expect(headers["Cache-Control"]).toBe("no-store");
      expect(headers["ETag"]).toBe("etag-val");
    });

    it("should build metadata objects appending timestamp logs", () => {
      const meta = ResponseMetadataBuilder.build(15, "corr-meta");
      expect(meta.correlationId).toBe("corr-meta");
      expect(meta.executionTimeMs).toBe(15);
      expect(meta.timestamp).toBeDefined();
    });
  });

  describe("Pagination & Link builder engines", () => {
    it("should calculate page size metrics using PaginationBuilder", () => {
      const meta1 = PaginationBuilder.build(1, 10, 25);
      expect(meta1.totalPages).toBe(3);

      const meta2 = PaginationBuilder.build(1, 10, 5);
      expect(meta2.totalPages).toBe(1);

      const meta3 = PaginationBuilder.build(1, 10, 0);
      expect(meta3.totalPages).toBe(1);
    });

    it("should generate navigation urls containing query parameters using LinkBuilder", () => {
      const links1 = LinkBuilder.build(1, 3, 10, "/users");
      expect(links1.self).toBe("/users?page=1&pageSize=10");
      expect(links1.first).toBe("/users?page=1&pageSize=10");
      expect(links1.last).toBe("/users?page=3&pageSize=10");
      expect(links1.next).toBe("/users?page=2&pageSize=10");
      expect(links1.prev).toBeUndefined();

      const links2 = LinkBuilder.build(2, 3, 10, "/users?foo=bar");
      expect(links2.prev).toBe("/users?page=1&pageSize=10");
      expect(links2.next).toBe("/users?page=3&pageSize=10");
    });

    it("should assemble list arrays and link structures using PagedResponseBuilder", () => {
      const builder = new PagedResponseBuilder();
      const res = builder.build(["a", "b"], 2, 2, 5, "/list");

      expect(res.success).toBe(true);
      expect(res.data).toEqual(["a", "b"]);
      expect(res.pagination.totalPages).toBe(3);
      expect(res.links.next).toBe("/list?page=3&pageSize=2");
    });
  });

  describe("Registries & Factories setups", () => {
    it("should maintain template templates registry lookup caches", () => {
      expect(ResponseRegistry.get("empty")).toBeUndefined();
      const tpl = new ApiResponse(true, {});
      ResponseRegistry.register("empty", tpl);
      expect(ResponseRegistry.get("empty")).toBe(tpl);
    });

    it("should instantiate builders configurations using ResponseFactory", () => {
      expect(ResponseFactory.createSuccessBuilder()).toBeInstanceOf(SuccessResponseBuilder);
      expect(ResponseFactory.createErrorBuilder()).toBeInstanceOf(ErrorResponseBuilder);
      expect(ResponseFactory.createPagedBuilder()).toBeInstanceOf(PagedResponseBuilder);
    });
  });
});
