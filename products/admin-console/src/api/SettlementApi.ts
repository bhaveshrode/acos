import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * SettlementApi executing settlements operations using EndpointDescriptor.
 */
export class SettlementApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getSettlement(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Settlement.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async initiateSettlement(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Settlement.Initiate)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
