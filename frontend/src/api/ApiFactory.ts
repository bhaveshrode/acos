import { ApiOptions } from "./ApiOptions.js";
import { ApiContext } from "./ApiContext.js";
import { TokenProvider, ITokenProvider } from "./TokenProvider.js";
import { ITokenStore } from "./ITokenStore.js";
import { ApiClient } from "./ApiClient.js";
import { RequestExecutor } from "./RequestExecutor.js";
import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestInterceptorPipeline } from "./RequestInterceptorPipeline.js";
import { ResponseInterceptorPipeline } from "./ResponseInterceptorPipeline.js";
import { LoggingInterceptor } from "./LoggingInterceptor.js";
import { RetryInterceptor } from "./RetryInterceptor.js";
import { IRetryPolicy } from "./IRetryPolicy.js";
import { AuthenticationHandler } from "./AuthenticationHandler.js";
import { AuthenticationInterceptor } from "./AuthenticationInterceptor.js";
import { ErrorInterceptor } from "./ErrorInterceptor.js";
import { CustomerApi } from "./CustomerApi.js";
import { IdentityApi } from "./IdentityApi.js";
import { OrganizationApi } from "./OrganizationApi.js";
import { InvoiceApi } from "./InvoiceApi.js";
import { PaymentApi } from "./PaymentApi.js";
import { SettlementApi } from "./SettlementApi.js";
import { AccountsReceivableApi } from "./AccountsReceivableApi.js";
import { NotificationApi } from "./NotificationApi.js";
import { WorkflowApi } from "./WorkflowApi.js";

/**
 * ApiFactory constructing REST communication clients, pipelines, and endpoints.
 */
export class ApiFactory {
  public static createTokenProvider(store: ITokenStore): ITokenProvider {
    return new TokenProvider(store);
  }

  public static createContext(options: ApiOptions, tokenProvider?: ITokenProvider): ApiContext {
    return new ApiContext(options, tokenProvider);
  }

  public static createClient(context: ApiContext): ApiClient {
    return new ApiClient(context);
  }

  public static createRequestPipeline(interceptors: any[] = []): RequestInterceptorPipeline {
    return new RequestInterceptorPipeline(interceptors);
  }

  public static createResponsePipeline(interceptors: any[] = []): ResponseInterceptorPipeline {
    return new ResponseInterceptorPipeline(interceptors);
  }

  public static createLoggingInterceptor(): LoggingInterceptor {
    return new LoggingInterceptor();
  }

  public static createRetryInterceptor(policy?: IRetryPolicy): RetryInterceptor {
    return new RetryInterceptor(policy);
  }

  public static createAuthenticationInterceptor(
    tokenProvider: ITokenProvider,
    scheme?: string
  ): AuthenticationInterceptor {
    const handler = new AuthenticationHandler(tokenProvider, scheme);
    return new AuthenticationInterceptor(handler);
  }

  public static createErrorInterceptor(): ErrorInterceptor {
    return new ErrorInterceptor();
  }

  public static createExecutor(
    client: ApiClient,
    reqPipe: RequestInterceptorPipeline,
    resPipe: ResponseInterceptorPipeline
  ): IRequestExecutor {
    return new RequestExecutor(client, reqPipe, resPipe);
  }

  public static createCustomerApi(executor: IRequestExecutor): CustomerApi {
    return new CustomerApi(executor);
  }

  public static createIdentityApi(executor: IRequestExecutor): IdentityApi {
    return new IdentityApi(executor);
  }

  public static createOrganizationApi(executor: IRequestExecutor): OrganizationApi {
    return new OrganizationApi(executor);
  }

  public static createInvoiceApi(executor: IRequestExecutor): InvoiceApi {
    return new InvoiceApi(executor);
  }

  public static createPaymentApi(executor: IRequestExecutor): PaymentApi {
    return new PaymentApi(executor);
  }

  public static createSettlementApi(executor: IRequestExecutor): SettlementApi {
    return new SettlementApi(executor);
  }

  public static createAccountsReceivableApi(executor: IRequestExecutor): AccountsReceivableApi {
    return new AccountsReceivableApi(executor);
  }

  public static createNotificationApi(executor: IRequestExecutor): NotificationApi {
    return new NotificationApi(executor);
  }

  public static createWorkflowApi(executor: IRequestExecutor): WorkflowApi {
    return new WorkflowApi(executor);
  }
}
