import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * AccountsReceivableApi executing receivables write-offs using EndpointDescriptor.
 */
export class AccountsReceivableApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getReceivable(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.AccountsReceivable.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async writeOffReceivable(id: string, payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.AccountsReceivable.WriteOff(id))
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
