import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * InvoiceApi executing invoicing operations using EndpointDescriptor.
 */
export class InvoiceApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getInvoice(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Invoice.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async issueInvoice(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Invoice.Issue)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
