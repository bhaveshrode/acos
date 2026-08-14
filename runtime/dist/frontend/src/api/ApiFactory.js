"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFactory = void 0;
const ApiContext_js_1 = require("./ApiContext.js");
const TokenProvider_js_1 = require("./TokenProvider.js");
const ApiClient_js_1 = require("./ApiClient.js");
const RequestExecutor_js_1 = require("./RequestExecutor.js");
const RequestInterceptorPipeline_js_1 = require("./RequestInterceptorPipeline.js");
const ResponseInterceptorPipeline_js_1 = require("./ResponseInterceptorPipeline.js");
const LoggingInterceptor_js_1 = require("./LoggingInterceptor.js");
const RetryInterceptor_js_1 = require("./RetryInterceptor.js");
const AuthenticationHandler_js_1 = require("./AuthenticationHandler.js");
const AuthenticationInterceptor_js_1 = require("./AuthenticationInterceptor.js");
const ErrorInterceptor_js_1 = require("./ErrorInterceptor.js");
const CustomerApi_js_1 = require("./CustomerApi.js");
const IdentityApi_js_1 = require("./IdentityApi.js");
const OrganizationApi_js_1 = require("./OrganizationApi.js");
const InvoiceApi_js_1 = require("./InvoiceApi.js");
const PaymentApi_js_1 = require("./PaymentApi.js");
const SettlementApi_js_1 = require("./SettlementApi.js");
const AccountsReceivableApi_js_1 = require("./AccountsReceivableApi.js");
const NotificationApi_js_1 = require("./NotificationApi.js");
const WorkflowApi_js_1 = require("./WorkflowApi.js");
/**
 * ApiFactory constructing REST communication clients, pipelines, and endpoints.
 */
class ApiFactory {
    static createTokenProvider(store) {
        return new TokenProvider_js_1.TokenProvider(store);
    }
    static createContext(options, tokenProvider) {
        return new ApiContext_js_1.ApiContext(options, tokenProvider);
    }
    static createClient(context) {
        return new ApiClient_js_1.ApiClient(context);
    }
    static createRequestPipeline(interceptors = []) {
        return new RequestInterceptorPipeline_js_1.RequestInterceptorPipeline(interceptors);
    }
    static createResponsePipeline(interceptors = []) {
        return new ResponseInterceptorPipeline_js_1.ResponseInterceptorPipeline(interceptors);
    }
    static createLoggingInterceptor() {
        return new LoggingInterceptor_js_1.LoggingInterceptor();
    }
    static createRetryInterceptor(policy) {
        return new RetryInterceptor_js_1.RetryInterceptor(policy);
    }
    static createAuthenticationInterceptor(tokenProvider, scheme) {
        const handler = new AuthenticationHandler_js_1.AuthenticationHandler(tokenProvider, scheme);
        return new AuthenticationInterceptor_js_1.AuthenticationInterceptor(handler);
    }
    static createErrorInterceptor() {
        return new ErrorInterceptor_js_1.ErrorInterceptor();
    }
    static createExecutor(client, reqPipe, resPipe) {
        return new RequestExecutor_js_1.RequestExecutor(client, reqPipe, resPipe);
    }
    static createCustomerApi(executor) {
        return new CustomerApi_js_1.CustomerApi(executor);
    }
    static createIdentityApi(executor) {
        return new IdentityApi_js_1.IdentityApi(executor);
    }
    static createOrganizationApi(executor) {
        return new OrganizationApi_js_1.OrganizationApi(executor);
    }
    static createInvoiceApi(executor) {
        return new InvoiceApi_js_1.InvoiceApi(executor);
    }
    static createPaymentApi(executor) {
        return new PaymentApi_js_1.PaymentApi(executor);
    }
    static createSettlementApi(executor) {
        return new SettlementApi_js_1.SettlementApi(executor);
    }
    static createAccountsReceivableApi(executor) {
        return new AccountsReceivableApi_js_1.AccountsReceivableApi(executor);
    }
    static createNotificationApi(executor) {
        return new NotificationApi_js_1.NotificationApi(executor);
    }
    static createWorkflowApi(executor) {
        return new WorkflowApi_js_1.WorkflowApi(executor);
    }
}
exports.ApiFactory = ApiFactory;
