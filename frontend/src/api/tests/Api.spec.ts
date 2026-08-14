import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiOptions } from "../ApiOptions.js";
import { ApiRequest } from "../ApiRequest.js";
import { ApiResponse } from "../ApiResponse.js";
import { ParsedResponse } from "../ParsedResponse.js";
import { ApiClient } from "../ApiClient.js";
import { RequestBuilder } from "../RequestBuilder.js";
import { ResponseParser } from "../ResponseParser.js";
import { RequestExecutor } from "../RequestExecutor.js";
import { MemoryTokenStore } from "../MemoryTokenStore.js";
import { TokenProvider } from "../TokenProvider.js";
import { AuthenticationHandler } from "../AuthenticationHandler.js";
import { LoggingInterceptor } from "../LoggingInterceptor.js";
import { FixedRetryPolicy } from "../FixedRetryPolicy.js";
import { ExponentialBackoffPolicy } from "../ExponentialBackoffPolicy.js";
import { NoRetryPolicy } from "../NoRetryPolicy.js";
import { RetryInterceptor } from "../RetryInterceptor.js";
import { AuthenticationInterceptor } from "../AuthenticationInterceptor.js";
import { ErrorInterceptor } from "../ErrorInterceptor.js";
import { ApiException } from "../ApiException.js";
import { ApiErrorMapper } from "../ApiErrorMapper.js";
import { EndpointDescriptor } from "../EndpointDescriptor.js";
import { CustomerApi } from "../CustomerApi.js";
import { InvoiceApi } from "../InvoiceApi.js";
import { ApiFactory } from "../ApiFactory.js";

describe("Frontend API Component Refactored Unit Tests (Task 65.8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("RequestBuilder & Parsers", () => {
    it("should assemble ApiRequest using RequestBuilder", () => {
      const request = new RequestBuilder()
        .setMethod("POST")
        .setUrl("/invoices")
        .addHeader("X-Custom", "Val")
        .addQuery("limit", "10")
        .setBody({ id: "1" })
        .setTimeout(5000)
        .build();

      expect(request.method).toBe("POST");
      expect(request.url).toBe("/invoices");
      expect(request.headers["X-Custom"]).toBe("Val");
      expect(request.query.limit).toBe("10");
      expect(request.body).toEqual({ id: "1" });
      expect(request.timeoutMs).toBe(5000);
      expect(Object.isFrozen(request)).toBe(true);
    });

    it("should parse standard JSON responses via ResponseParser returning ParsedResponse", async () => {
      const mockHeaders = new Headers();
      mockHeaders.set("Content-Type", "application/json");
      mockHeaders.set("Cache-Control", "no-cache");

      const responseObj = {
        headers: mockHeaders,
        status: 200,
        json: async () => ({ ok: true }),
        text: async () => '{"ok":true}'
      } as Response;

      const parsed = await ResponseParser.parse(responseObj, 15);
      expect(parsed).toBeInstanceOf(ParsedResponse);
      expect(parsed.contentType).toContain("application/json");
      expect(parsed.rawBody).toEqual({ ok: true });

      const apiResponse = parsed.response;
      expect(apiResponse.status).toBe(200);
      expect(apiResponse.data).toEqual({ ok: true });
      expect(apiResponse.headers["content-type"]).toBe("application/json");
      expect(apiResponse.durationMs).toBe(15);
    });
  });

  describe("Authentication & Token Stores", () => {
    it("should retrieve, set, and clear tokens via TokenProvider delegating to TokenStore", () => {
      const store = new MemoryTokenStore();
      const provider = new TokenProvider(store);
      expect(provider.getToken()).toBeNull();

      provider.setToken("access-123");
      expect(provider.getToken()).toBe("access-123");
      expect(store.retrieveToken()).toBe("access-123");

      provider.clearToken();
      expect(provider.getToken()).toBeNull();
    });

    it("should attach Bearer headers using AuthenticationHandler", () => {
      const store = new MemoryTokenStore();
      const provider = new TokenProvider(store);
      provider.setToken("tkn-abc");
      const handler = new AuthenticationHandler(provider, "Bearer");

      const baseReq = new ApiRequest("GET", "/me");
      const authReq = handler.attachToken(baseReq);

      expect(authReq.headers.Authorization).toBe("Bearer tkn-abc");
    });
  });

  describe("Retry Policies", () => {
    it("should evaluate backoffs via Fixed, Exponential, and NoRetry policies", () => {
      const noRetry = new NoRetryPolicy();
      expect(noRetry.shouldRetry()).toBe(false);

      const fixed = new FixedRetryPolicy(3, 1000);
      expect(fixed.shouldRetry(0, 503)).toBe(true);
      expect(fixed.shouldRetry(3, 503)).toBe(false);
      expect(fixed.getDelayMs()).toBe(1000);

      const exp = new ExponentialBackoffPolicy(3, 500);
      expect(exp.shouldRetry(0, 504)).toBe(true);
      expect(exp.getDelayMs(0)).toBe(500);
      expect(exp.getDelayMs(1)).toBe(1000);
      expect(exp.getDelayMs(2)).toBe(2000);
    });
  });

  describe("Interceptors & Pipelines", () => {
    it("should execute request and response filters inside RequestExecutor", async () => {
      const store = new MemoryTokenStore();
      const provider = new TokenProvider(store);
      provider.setToken("my-token");

      const logging = new LoggingInterceptor();
      const retry = new RetryInterceptor(new FixedRetryPolicy());
      const authInt = new AuthenticationInterceptor(new AuthenticationHandler(provider));
      const errorInt = new ErrorInterceptor();

      const context = ApiFactory.createContext({ baseUrl: "https://api.acos.internal" }, provider);
      const client = ApiFactory.createClient(context);

      const mockResponse = new ApiResponse({ foo: "bar" }, 200, { "content-type": "application/json" }, 10);
      const executeSpy = vi.spyOn(client, "execute").mockResolvedValue(mockResponse);

      const reqPipe = ApiFactory.createRequestPipeline([logging, authInt]);
      const resPipe = ApiFactory.createResponsePipeline([logging, retry, errorInt]);
      const executor = ApiFactory.createExecutor(client, reqPipe, resPipe);

      const baseReq = new RequestBuilder().setUrl("/resource").build();
      const finalRes = await executor.execute(baseReq);

      expect(finalRes.data).toEqual({ foo: "bar" });
      expect(logging.getLogs()).toContain("[API REQUEST] GET -> /resource");
      expect(logging.getLogs().some(log => log.includes("[API RESPONSE] Status: 200"))).toBe(true);

      // Verify Auth Token was attached during request pipeline run
      expect(executeSpy).toHaveBeenCalled();
      const executedReq = executeSpy.mock.calls[0][0];
      expect(executedReq.headers.Authorization).toBe("Bearer my-token");
    });
  });

  describe("Error Mapping & Exceptions", () => {
    it("should throw strongly typed exceptions on HTTP failure codes", async () => {
      const context = ApiFactory.createContext({ baseUrl: "http://test" });
      const client = ApiFactory.createClient(context);
      
      const mockErrResponse = new ApiResponse({ error: "Invalid Parameter", message: "ID is invalid" }, 400);
      const executeSpy = vi.spyOn(client, "execute").mockResolvedValue(mockErrResponse);

      const reqPipe = ApiFactory.createRequestPipeline();
      const resPipe = ApiFactory.createResponsePipeline();
      const executor = ApiFactory.createExecutor(client, reqPipe, resPipe);

      const request = new RequestBuilder().setUrl("/bad").build();
      await expect(executor.execute(request)).rejects.toThrow(ApiException);

      executeSpy.mockClear();
      executeSpy.mockResolvedValue(mockErrResponse);

      try {
        await executor.execute(request);
      } catch (err: any) {
        expect(err.status).toBe(400);
        expect(err.message).toBe("ID is invalid");
        expect(err.responseData).toEqual({ error: "Invalid Parameter", message: "ID is invalid" });
      }
    });

    it("should map transport errors correctly via ApiErrorMapper", () => {
      const req = new ApiRequest("GET", "/offline");
      const mapped = ApiErrorMapper.mapTransportError(new Error("Connection reset"), req);
      expect(mapped.message).toContain("Network connection failure");
      expect(mapped.message).toContain("Connection reset");
    });
  });

  describe("Endpoint Services & Factories", () => {
    it("should invoke expected methods on endpoint services delegating to executor", async () => {
      const mockResponse = new ApiResponse({ id: "cust-99" }, 200);
      
      const context = ApiFactory.createContext({ baseUrl: "http://dummy" });
      const client = ApiFactory.createClient(context);
      const executeSpy = vi.spyOn(client, "execute").mockResolvedValue(mockResponse);

      const reqPipe = ApiFactory.createRequestPipeline();
      const resPipe = ApiFactory.createResponsePipeline();
      const executor = ApiFactory.createExecutor(client, reqPipe, resPipe);

      const customerApi = ApiFactory.createCustomerApi(executor);
      const resCust = await customerApi.getCustomer("cust-99");
      expect(resCust.data).toEqual({ id: "cust-99" });

      const issueResponse = new ApiResponse({ id: "inv-11" }, 201);
      executeSpy.mockResolvedValue(issueResponse);

      const invoiceApi = ApiFactory.createInvoiceApi(executor);
      const resInv = await invoiceApi.issueInvoice({ amount: 100 });
      expect(resInv.data).toEqual({ id: "inv-11" });
      expect(resInv.status).toBe(201);
    });

    it("should verify static URL layouts on EndpointDescriptor", () => {
      expect(EndpointDescriptor.Customer.Get("123")).toBe("/customers/123");
      expect(EndpointDescriptor.Identity.Login).toBe("/users/login");
      expect(EndpointDescriptor.Invoice.Issue).toBe("/invoices");
    });
  });
});
