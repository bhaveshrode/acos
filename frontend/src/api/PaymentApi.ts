import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * PaymentApi executing payments checking operations using EndpointDescriptor.
 */
export class PaymentApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getPayment(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Payment.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async processPayment(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Payment.Process)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
