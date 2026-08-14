import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * CustomerApi executing customer actions via centralized endpoint descriptors.
 */
export class CustomerApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getCustomer(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Customer.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async createCustomer(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Customer.Create)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
